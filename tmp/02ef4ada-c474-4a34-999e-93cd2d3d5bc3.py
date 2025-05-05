from manim import *

# Set dark background
config.background_color = "#1C1C1C"

from manim import *

class DFSAnimation(Scene):
    def construct(self):
        # Define nodes and edges
        nodes = {
            "A": Dot(point=LEFT * 3 + UP * 2, color=BLUE),
            "B": Dot(point=LEFT * 1 + UP * 2, color=BLUE),
            "C": Dot(point=RIGHT * 1 + UP * 2, color=BLUE),
            "D": Dot(point=RIGHT * 3 + UP * 2, color=BLUE),
            "E": Dot(point=LEFT * 3 + DOWN * 1, color=BLUE),
            "F": Dot(point=LEFT * 1 + DOWN * 1, color=BLUE),
            "G": Dot(point=RIGHT * 1 + DOWN * 1, color=BLUE),
            "H": Dot(point=RIGHT * 3 + DOWN * 1, color=BLUE),
        }

        labels = {
            node: Tex(node, color=WHITE).move_to(nodes[node])
            for node in nodes
        }

        edges = [
            ("A", "B"), ("A", "E"),
            ("B", "C"), ("B", "F"),
            ("C", "D"), ("C", "G"),
            ("D", "H"),
            ("E", "F"),
            ("F", "G"),
            ("G", "H")
        ]

        lines = {
            (start, end): Line(nodes[start].get_center(), nodes[end].get_center(), color=WHITE)
            for start, end in edges
        }

        # Add all objects to the scene
        self.play(*[Create(node) for node in nodes.values()])
        self.play(*[Create(label) for label in labels.values()])
        self.play(*[Create(line) for line in lines.values()])
        self.wait(1)

        # DFS algorithm visualization
        visited = set()
        stack = ["A"]
        visited_nodes = [] # Store the order visited to highlight later

        highlight_color = YELLOW

        def dfs(node_name):
          if node_name in visited:
            return
          
          visited.add(node_name)
          visited_nodes.append(node_name)

          #Highlight the current node
          self.play(nodes[node_name].animate.set_color(highlight_color), run_time = 0.5)
          self.wait(0.3) #Short pause to see the highlighted node

          neighbors = []
          for start, end in edges:
              if start == node_name:
                  neighbors.append(end)
          
          for neighbor in neighbors:
              if (node_name, neighbor) in lines:
                current_edge = (node_name, neighbor)
              else:
                current_edge = (neighbor, node_name)
              
              #Highlight edge
              self.play(lines[current_edge].animate.set_color(highlight_color), run_time = 0.3)
              self.wait(0.1) #Small pause before next call.
              dfs(neighbor)
              self.play(lines[current_edge].animate.set_color(WHITE), run_time = 0.2)
          
          self.play(nodes[node_name].animate.set_color(BLUE), run_time = 0.3)
        
        #Run dfs
        dfs("A")

        # Reset edge colors
        self.play(*[line.animate.set_color(WHITE) for line in lines.values()])

        self.wait(2)