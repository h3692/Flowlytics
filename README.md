**Inspiration**


Digital commerce is constantly optimized using behavioural analytics, funnels, and A/B testing — but physical spaces are still designed largely through intuition and one-off observations. Despite accounting for a significant share of commerce, physical stores lack the same level of behavioral insight, leaving layouts static and rarely optimized with real data. Yet retail stores also have a user experience that can be measured and improved — just not with the same ease as e-commerce. But Flowlytics was born from the question: what if Amplitude existed for physical retail stores?

**What it does**
Flowlytics helps retailers analyze and optimize store layouts by simulating how customers move and engage within a physical space.

Using a simulation of a real grocery store layout with agents following a Manhattan based pathing system, Flowlytics models a retail store as a walkable floor plan with obstacles, product zones, and checkout areas. Simulated customers navigate the space, generate engagement events such as zone entry and dwell, and collectively produce a projected heat map that highlights high-traffic areas, engagement hotspots, and cold spots. By comparing heat maps across different layout variants, Flowlytics enables retailers to run A/B-style experiments on floor plans, identify layouts that improve product visibility, and iteratively refine their stores before making real-world changes.

**How we built it**
Due to privacy concerns and video constraints, we’ve created a simulation of a real grocery store layout with agents following a Manhattan based pathing system, representing the processed output that Flowlytics would generate once video data is available. We represent the store as a grid with obstacles (shelves, checkout) and defined product zones. Simulated customers enter, follow navigation rules and preferences, and generate “events” like zone entry and dwell. We convert these trajectories into heat maps and cold-spot metrics, then compare layout variants to identify changes that improve coverage and engagement.

We then feed the heat map into the Gemini API, which analyzes the spatial patterns and generates recommendations, such as rearranging shelves or redistributing product categories to improve flow and engagement.

After applying these changes to the simulation, we rerun the model. The hypothesis is that traffic becomes more evenly distributed, reducing congestion and increasing exposure to under-visited areas. This process repeats in a loop—simulate, analyze, optimize, and test again—allowing Flowlytics to continuously self-improve.

This creates a data → insight → action loop for physical spaces: simulate behavior, measure outcomes, propose layout updates, and re-simulate to validate improvements.

**Identity!**
In digital products, we understand users through their behavior. In physical stores, that understanding doesn’t exist. Retailers don’t know how customers actually move, where they hesitate, or which parts of the store fail to engage them. That means they’re designing spaces without feedback.

Flowlytics fixes this by turning physical movement into behavioral data. In our demo, we use a Mesa-based simulation of a real store layout to model customer journeys and generate a heat map of attention and traffic. This behavioral pattern is what we mean by customer identity in a physical space. Once it’s visible, we can analyze it, change the layout, rerun the simulation, and iteratively improve the customer journey.

**Challenges we ran into**
One of our biggest challenges was the lack of publicly available datasets for this type of problem. The ideal input for Flowlytics would be bird’s-eye video footage covering an entire retail store, which would allow us to use computer vision techniques to extract real foot-traffic data and generate heat maps directly from observed customer behavior. However, this type of footage is rarely available online due to privacy concerns and store-specific constraints, making it difficult to source realistic data for development and testing.

To address this, we pivoted to using agent-based simulation with Mesa to model customer movement and engagement in a controlled, privacy-preserving way. This allowed us to prototype the full analytics and optimization loop — from behavior generation to heat-map analysis and layout iteration — without relying on unavailable real-world data. In future iterations, we plan to integrate real bird’s-eye video inputs when available, using computer vision to calibrate and validate the simulation with actual customer behavior.

**Accomplishments that we're proud of**
-Translating digital commerce analytics concepts into the physical retail world
-Designing an Amplitude-style event schema for in-store customer behavior
-Building an end-to-end system that connects behavior → insight → layout decisions
-Creating a product that complements Shopify by optimizing in-store merchandising, not competing with it
-Delivering a realistic retail optimization tool within a hackathon timeframe
**What we learned**
We learned that physical retail can benefit enormously from the same analytics mindset that powers modern e-commerce. When customer movement is treated as behavioral data, store layouts become testable, measurable, and optimizable — just like Shopify storefronts. We also learned how important it is to keep AI grounded in real behavioral signals when making commerce decisions.

**What's next for Flowlytics**
Next, we plan to:

Integrate real-world foot-traffic data using computer vision to extract customer movement paths, with - built-in anonymization to protect individual privacy, and map them into the simulation.
Calibrate the Mesa-based simulation using observed traffic statistics such as dwell time, congestion, and movement probabilities.
Define quantitative optimization metrics beyond heatmap uniformity (e.g., congestion variance, zone exposure, average dwell time).
Formalize a closed-loop optimization pipeline where AI-generated layout changes are automatically simulated and scored under real-world constraints.
