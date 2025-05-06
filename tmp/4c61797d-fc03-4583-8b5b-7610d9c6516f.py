from manim import *

# Set dark background
config.background_color = "#1C1C1C"

from manim import *

class DFSAnimation(Scene):
    def construct(self):
        # Define nodes and edges
        nodes = {
            'A': Dot(point=LEFT * 3 + UP * 2, color=BLUE),
            'B': Dot(point=LEFT * 1 + UP * 2, color=BLUE),
            'C': Dot(point=RIGHT * 1 + UP * 2, color=BLUE),
            'D': Dot(point=RIGHT * 3 + UP * 2, color=BLUE),
            'E': Dot(point=LEFT * 3 + DOWN * 2, color=BLUE),
            'F': Dot(point=LEFT * 1 + DOWN * 2, color=BLUE),
            'G': Dot(point=RIGHT * 1 + DOWN * 2, color=BLUE),
            'H': Dot(point=RIGHT * 3 + DOWN * 2, color=BLUE),
        }

        node_labels = {
            'A': Text("A").next_to(nodes['A'], UP),
            'B': Text("B").next_to(nodes['B'], UP),
            'C': Text("C").next_to(nodes['C'], UP),
            'D': Text("D").next_to(nodes['D'], UP),
            'E': Text("E").next_to(nodes['E'], DOWN),
            'F': Text("F").next_to(nodes['F'], DOWN),
            'G': Text("G").next_to(nodes['G'], DOWN),
            'H': Text("H").next_to(nodes['H'], DOWN),
        }

        edges = [
            ('A', 'B'), ('A', 'E'),
            ('B', 'C'), ('B', 'F'),
            ('C', 'D'), ('C', 'G'),
            ('D', 'H'),
            ('E', 'F'),
            ('F', 'G'),
            ('G', 'H'),
        ]

        edge_objects = {}
        for start, end in edges:
            edge_objects[(start, end)] = Line(nodes[start].get_center(), nodes[end].get_center(), color=WHITE)

        # Add nodes and edges to the scene
        self.play(*[Create(node) for node in nodes.values()])
        self.play(*[Create(label) for label in node_labels.values()])
        self.play(*[Create(edge) for edge in edge_objects.values()])
        self.wait(1)

        # DFS Algorithm Visualization
        visited = set()
        stack = ['A']
        path = []

        def dfs_step(node):
            if node not in visited:
                visited.add(node)
                path.append(node)
                self.play(nodes[node].animate.set_fill(color=YELLOW), run_time=0.5)
                self.wait(0.2)

                neighbors = []
                for start, end in edges:
                    if start == node:
                        neighbors.append(end)
                for start, end in edges:
                    if end == node:
                        neighbors.append(start)

                neighbors = list(set(neighbors))


                for neighbor in neighbors:
                    if (node, neighbor) in edge_objects:
                         edge = edge_objects[(node, neighbor)]
                    elif (neighbor, node) in edge_objects:
                        edge = edge_objects[(neighbor, node)]
                    else:
                        edge = None

                    if edge:
                        self.play(edge.animate.set_color(YELLOW), run_time=0.3)
                        self.wait(0.2)
                        if neighbor not in visited:
                            dfs_step(neighbor)
                        else:
                            self.play(edge.animate.set_color(WHITE), run_time=0.3)
                        self.wait(0.2)
                    else:
                        print("ERROR: Edge not found")


                self.play(nodes[node].animate.set_fill(color=BLUE), run_time=0.5)
                path.pop()



        dfs_step('A')

        self.wait(2)