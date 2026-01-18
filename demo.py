import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import random
import google.generativeai as genai
import re
from mesa import Agent, Model
from mesa.time import RandomActivation
from mesa.space import MultiGrid

# --- 1. CONFIGURATION ---
# !!! PASTE YOUR API KEY HERE !!!
API_KEY = ""  
try:
    genai.configure(api_key=API_KEY)
except Exception as e:
    st.error(f"API Key Error: {e}")

# --- 2. DATA CONSTANTS ---

# Expanded Variety for colorful visualization
PRODUCT_KEYS = list("cjspSCkowhFbtV") 

PRODUCT_MAP = {
    # Structure
    "#": "Wall", ".": "Floor", "E": "Entrance", "X": "Checkout", 
    # Perimeter
    "M": "Meat", "D": "Dairy", "P": "Produce", "B": "Bakery", "Z": "Frozen", 
    # Center Store (The Variety)
    "c": "Cereal", "j": "Juice", "s": "Soda", "p": "Pasta", "S": "Sauce", 
    "C": "Chips", "k": "Cookies", "o": "Oil/Condiments", "w": "Water", "h": "Household", 
    "F": "Pet Food", "b": "Baby", "t": "Tea/Coffee", "V": "Canned Veg"
}

# Distinct Colors for every product type
COLOR_MAP = {
    "Wall": "#000000", "Floor": "#FAFAFA", "Entrance": "#444444", "Checkout": "#666666",
    "Meat": "#EF5350", "Dairy": "#FFF9C4", "Produce": "#66BB6A", "Bakery": "#D7CCC8",
    "Frozen": "#4FC3F7", "Cereal": "#FFF176", "Juice": "#FFB74D", "Soda": "#E53935",
    "Pasta": "#FFE0B2", "Sauce": "#BF360C", "Chips": "#FFCA28", "Cookies": "#8D6E63",
    "Oil/Condiments": "#FDD835", "Water": "#29B6F6", "Household": "#7E57C2",
    "Pet Food": "#5D4037", "Baby": "#F48FB1", "Tea/Coffee": "#4E342E", "Canned Veg": "#33691E"
}

# Probability Weights (Essentials are more common)
ITEM_ODDS = {
    "Meat": 0.8, "Dairy": 0.8, "Produce": 0.8, "Bakery": 0.6, "Frozen": 0.5, 
    "Cereal": 0.4, "Soda": 0.4, "Chips": 0.4, "Pasta": 0.3, "Household": 0.1,
    "Juice": 0.3, "Water": 0.2, "Baby": 0.1
}

# --- 3. MESA CLASSES ---

class ShelfAgent(Agent):
    def __init__(self, unique_id, model, product_type):
        super().__init__(unique_id, model)
        self.product_type = product_type

class ShopperAgent(Agent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.shopping_list = self.generate_weighted_list()
        self.finished_shopping = False
        
    def generate_weighted_list(self):
        # Generate a list of 10-15 items based on weights
        my_list = []
        available_items = [k for k in ITEM_ODDS.keys()]
        # Add a few random "Niche" items from the center store
        center_items = list("cjspSCkowhFbtV")
        
        # 1. Essentials
        for item, chance in ITEM_ODDS.items():
            if random.random() < chance:
                my_list.append(item)
                
        # 2. Random Variety (Force them into the aisles)
        my_list.extend(random.choices(center_items, k=3))
        
        random.shuffle(my_list)
        return my_list

    def respawn(self):
        self.shopping_list = self.generate_weighted_list()
        self.finished_shopping = False
        if self.pos is None: return
        
        if self.model.spawn_points:
            new_pos = self.random.choice(self.model.spawn_points)
            self.model.grid.move_agent(self, new_pos)
        else:
            self.model.grid.move_agent(self, (1, 1))

    def move(self):
        if self.pos is None: return
        
        # HEATMAP: Track where they step
        self.model.heatmap_data[self.pos[0]][self.pos[1]] += 1
        
        if self.finished_shopping:
            self.respawn()
            return
        
        target_type = "Checkout" if not self.shopping_list else self.shopping_list[0]
        target_pos = self.find_nearest(target_type)
        
        possible = self.model.grid.get_neighborhood(self.pos, moore=True, include_center=False)
        # Agents cannot walk through Shelves or Walls
        valid = [p for p in possible if not any(isinstance(o, ShelfAgent) for o in self.model.grid.get_cell_list_contents(p))]

        if not valid: return

        if target_pos:
            tx, ty = target_pos
            # Sort by distance
            valid.sort(key=lambda p: abs(p[0]-tx) + abs(p[1]-ty))
            
            # Congestion Logic: If best spot is crowded, maybe pick 2nd best?
            # For now, simple Distance + Randomness
            next_pos = valid[0] if self.random.random() > 0.1 else self.random.choice(valid)
        else:
            next_pos = self.random.choice(valid)
        
        self.model.grid.move_agent(self, next_pos)

    def find_nearest(self, p_type):
        if self.pos is None: return None
        # Map generic names (e.g. "Juice") back to codes ('j') if needed, 
        # but product_locations stores the 'product_type' string directly.
        
        # Find product code from name if needed
        target_code = None
        for k, v in PRODUCT_MAP.items():
            if v == p_type:
                target_code = v # We stored the full name in ShelfAgent
                break
                
        if not target_code: target_code = p_type

        locs = self.model.product_locations.get(target_code, [])
        if not locs: return None
        return min(locs, key=lambda p: abs(p[0]-self.pos[0]) + abs(p[1]-self.pos[1])) if locs else None

    def interact(self):
        if self.pos is None or not self.shopping_list: return
        target = self.shopping_list[0]
        neighbors = self.model.grid.get_neighbors(self.pos, moore=True, include_center=False)
        for a in neighbors:
            if isinstance(a, ShelfAgent) and a.product_type == target:
                self.shopping_list.pop(0)
                # Buying adds HEAT (Dwell time)
                self.model.heatmap_data[self.pos[0]][self.pos[1]] += 5 
                break

    def step(self):
        self.move()
        self.interact()

class RetailStoreModel(Model):
    def __init__(self, layout, num_shoppers=50):
        self.layout = layout
        self.height = len(layout)
        self.width = len(layout[0])
        self.grid = MultiGrid(self.width, self.height, torus=False)
        self.schedule = RandomActivation(self)
        self.heatmap_data = np.zeros((self.width, self.height))
        self.spawn_points = []
        self.product_locations = {} 

        for y, row in enumerate(reversed(self.layout)):
            for x, char in enumerate(row):
                if x >= self.width: continue
                
                if char == "E":
                    self.spawn_points.append((x, y))
                    continue
                
                if char in PRODUCT_MAP:
                    p_type = PRODUCT_MAP[char]
                    if p_type == "Floor": continue
                    
                    shelf = ShelfAgent(f"S_{x}_{y}", self, p_type)
                    self.grid.place_agent(shelf, (x, y))
                    
                    if p_type not in self.product_locations: self.product_locations[p_type] = []
                    self.product_locations[p_type].append((x, y))

        for i in range(num_shoppers):
            a = ShopperAgent(i, self)
            self.schedule.add(a)
            if self.spawn_points: 
                self.grid.place_agent(a, random.choice(self.spawn_points))
            else:
                self.grid.place_agent(a, (1, 1))

    def step(self):
        self.schedule.step()

# --- 4. HELPER FUNCTIONS ---

def sanitize_layout(layout, target_w=48, target_h=48):
    if len(layout) > target_h: layout = layout[:target_h]
    elif len(layout) < target_h:
        for _ in range(target_h - len(layout)): layout.append('.' * target_w)
    clean = []
    for row in layout:
        if len(row) > target_w: clean.append(row[:target_w])
        elif len(row) < target_w: clean.append(row + '.' * (target_w - len(row)))
        else: clean.append(row)
    return clean

def generate_initial_layout(width, height):
    layout = [['.' for _ in range(width)] for _ in range(height)]
    # Walls
    for y in range(height):
        for x in range(width):
            if x == 0 or x == width - 1 or y == 0 or y == height - 1: layout[y][x] = '#'
    
    # Anchors (Perimeter)
    for x in range(2, width-2): layout[height-2][x] = 'M' 
    for y in range(5, height-5): layout[y][2] = 'Z' 
    
    # Center Aisles (Striped Variety)
    # Create blocks of shelves
    for x in range(8, width-8, 5): # Spaced out columns
        for y in range(8, height-8):
            # Create Breaks in aisles for cross-traffic
            if y == height//2 or y == height//2 -1: continue 
            
            # Alternate products vertically for maximum color
            prod = PRODUCT_KEYS[(y + x) % len(PRODUCT_KEYS)]
            layout[y][x] = prod
            layout[y][x+1] = prod

    mid = width // 2
    layout[1][mid] = 'E'; layout[4][5] = 'X'
    return ["".join(row) for row in layout]

def get_gemini_suggestions(layout, report):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are a Retail Merchandising AI. Your goal is to optimize product placement without expensive construction.
        
        CURRENT LAYOUT (ASCII):
        {chr(10).join(layout)}
        
        TRAFFIC REPORT:
        {report}
        
        STRATEGY:
        1. "Conservative Renovation": Do NOT move Walls (#) or Shelves unless absolutely necessary.
        2. "Merchandising": Swap product categories on existing shelves to balance traffic. Move high-traffic items away from congestion.
        3. "Dead Spots": If a floor area has 0 traffic, place a popular "Magnet Item" (like Milk or Bread) nearby to draw people in.
        
        CRITICAL RULES:
        1. Maintain exactly 48 rows and 48 columns.
        2. Keep Entrances (E) and Checkouts (X) in place.
        3. Output MUST be a python list of strings.
        4. DO NOT TOUCH EXTERNAL WALLS OR STRUCTURES
        5. DO NOT CREATE NEW PRODUCTS OR REMOVE EXISTING ONES, ONLY MOVE THE CONFIGURATION OF PRODUCTS
        6. CONSIDER THE REALM OF REASON, DO NOT IMPLEMENT CHANGES THAT ARE TOO DESTRUCTIVE, DRASTIC OR OTHERWISE WOULD CREATE EGREGIOUSLY LARGE SHIFTS IN THE STORE LAYOUT
        
        RESPONSE FORMAT:
        SUGGESTIONS:
        - [Suggestion 1]
        - [Suggestion 2]
        LAYOUT:
        ['row1', 'row2', ...]
        """
        response = model.generate_content(prompt)
        text = response.text
        
        suggestions = []
        if "SUGGESTIONS:" in text:
            parts = text.split("SUGGESTIONS:")[1].split("LAYOUT:")[0]
            suggestions = [line.strip() for line in parts.split('\n') if line.strip().startswith("-")]
            
        new_layout = []
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            new_layout = eval(match.group(0))
            new_layout = sanitize_layout(new_layout)
        else:
            new_layout = layout
            
        return suggestions, new_layout
    except Exception as e:
        return [f"API Error: {e}"], layout

# --- 5. MAIN APP ---
def main():
    st.set_page_config(layout="wide", page_title="Retail Sim")
    
    if 'layout' not in st.session_state:
        st.session_state.layout = generate_initial_layout(48, 48)
    if 'heatmap' not in st.session_state:
        st.session_state.heatmap = None
    if 'suggestions' not in st.session_state:
        st.session_state.suggestions = []
    if 'proposed_layout' not in st.session_state:
        st.session_state.proposed_layout = None
    if 'sim_count' not in st.session_state:
        st.session_state.sim_count = 0

    st.title("🛒 Retail Optimization Dashboard")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader(f"Simulation (Run {st.session_state.sim_count})")
        
        sim_placeholder = st.empty()
        
        def draw_map(layout, heatmap=None, agents=None):
            fig, ax = plt.subplots(figsize=(6, 6))
            
            if heatmap is None:
                # 1. VISUALIZE PRODUCTS
                grid = np.zeros((48, 48))
                keys = list(COLOR_MAP.keys())
                for y, row in enumerate(reversed(layout)):
                    for x, char in enumerate(row):
                        p_name = PRODUCT_MAP.get(char, "Floor")
                        if p_name not in keys: p_name = "Floor"
                        grid[y][x] = keys.index(p_name)
                cmap = mcolors.ListedColormap([COLOR_MAP[k] for k in keys])
                ax.imshow(grid, cmap=cmap)
                
                if agents:
                    xs = [a.pos[0] for a in agents if a.pos]
                    ys = [a.pos[1] for a in agents if a.pos]
                    ax.scatter(xs, ys, c='red', s=30, edgecolors='black', linewidth=0.5, alpha=0.8)
                    ax.set_title("Simulation Live...")
                else:
                    ax.set_title("Floor Plan")
            else:
                # 2. VISUALIZE HEATMAP
                # Mask shelves (values of 0 that are shelves) so they don't look like dead floor
                shelf_mask = np.zeros((48, 48), dtype=bool)
                for y, row in enumerate(reversed(layout)):
                    for x, char in enumerate(row):
                        if char not in ['.', 'E', 'X']: # It's a shelf/wall
                            shelf_mask[y][x] = True
                            
                cmap = plt.cm.turbo.copy() # Turbo is great for distinct gradients
                cmap.set_bad(color='#000000')
                
                # We mask real zeros (dead floor)
                # But we want to distinguish shelves from dead floor
                masked = np.ma.masked_where(heatmap == 0, heatmap)
                
                # VMAX=30 for high sensitivity
                im = ax.imshow(masked.T, cmap=cmap, interpolation='nearest', origin='lower', vmax=30)
                plt.colorbar(im, ax=ax, label="Visits")
                ax.set_title("Traffic Intensity")
            
            return fig

        # Initial Draw
        if st.session_state.heatmap is None:
            fig = draw_map(st.session_state.layout)
            sim_placeholder.pyplot(fig)
            plt.close(fig)
        else:
            fig = draw_map(st.session_state.layout, heatmap=st.session_state.heatmap)
            sim_placeholder.pyplot(fig)
            plt.close(fig)

        # ANIMATION BUTTON
        if st.button("🚀 Run Simulation (Step-by-Step)"):
            model = RetailStoreModel(st.session_state.layout, num_shoppers=50)
            
            progress_bar = st.progress(0)
            for i in range(400):
                model.step()
                if i % 25 == 0: # Update every 25 frames
                    fig = draw_map(st.session_state.layout, agents=model.schedule.agents)
                    sim_placeholder.pyplot(fig)
                    plt.close(fig)
                    progress_bar.progress(i / 400)
            
            progress_bar.progress(100)
            st.session_state.heatmap = model.heatmap_data
            st.rerun()

    with col2:
        st.subheader("AI Analysis")
        
        if st.session_state.heatmap is not None:
            flat = st.session_state.heatmap.flatten()
            max_val = np.max(flat)
            # Count legitimate dead spots (Floor tiles with 0 visits)
            floor_mask = []
            for row in st.session_state.layout:
                floor_mask.extend([1 if c == '.' else 0 for c in row])
            floor_mask = np.array(floor_mask).reshape(48, 48)
            
            dead_spots = np.sum((st.session_state.heatmap == 0) & (floor_mask.T == 1))
            
            st.warning(f"Max Congestion: {max_val} | Dead Floor Spots: {dead_spots}")
            
            if st.button("✨ Optimize Layout"):
                with st.spinner("Analyzing traffic patterns..."):
                    report = f"Max Traffic: {max_val}, Unvisited Floor Tiles: {dead_spots}"
                    sugg, new_lay = get_gemini_suggestions(st.session_state.layout, report)
                    st.session_state.suggestions = sugg
                    st.session_state.proposed_layout = new_lay
                    st.rerun()

        if st.session_state.suggestions:
            st.success("Proposed Improvements:")
            for s in st.session_state.suggestions:
                st.write(s)
            
            if st.button("✅ Apply Changes"):
                st.session_state.layout = st.session_state.proposed_layout
                st.session_state.heatmap = None
                st.session_state.suggestions = []
                st.session_state.sim_count += 1
                st.rerun()

if __name__ == "__main__":
    main()