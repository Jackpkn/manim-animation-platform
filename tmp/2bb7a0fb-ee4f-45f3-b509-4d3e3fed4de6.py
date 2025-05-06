from manim import *

# Set dark background
config.background_color = "#1C1C1C"

from manim import *

class DFSAnimation(Scene):
    def construct(self):
        # Define graph nodes
        nodes = {
            "A": (0, 2, 0),
            "B": (-2, 0, 0),
            "C": (2, 0, 0),
            "D": (-1, -2, 0),
            "E": (1, -2, 0),
            "F": (0, -4, 0),
        }

        # Create node objects
        node_objects = {
            node: Circle(radius=0.5, color=WHITE, fill_opacity=1).move_to(pos)
            for node, pos in nodes.items()
        }

        # Create node labels
        node_labels = {
            node: Tex(node).move_to(node_objects[node].get_center())
            for node in nodes
        }

        # Define edges
        edges = [
            ("A", "B"),
            ("A", "C"),
            ("B", "D"),
            ("B", "E"),
            ("C", "E"),
            ("D", "F"),
            ("E", "F"),
        ]

        # Create edge objects
        edge_objects = []
        for start_node, end_node in edges:
            edge = Line(
                node_objects[start_node].get_center(),
                node_objects[end_node].get_center(),
                color=WHITE,
            )
            edge_objects.append(edge)

        # Group nodes, labels, and edges
        graph_objects = [*node_objects.values(), *node_labels.values(), *edge_objects]

        # Initial setup
        self.play(Create(VGroup(*graph_objects)))
        self.wait(1)

        # DFS traversal function
        def dfs(start_node, visited, color=YELLOW):
            visited.add(start_node)
            node_objects[start_node].set_fill(color)
            self.play(node_objects[start_node].animate.set_fill(color))
            self.wait(0.5)

            for start, end in edges:
                if start == start_node:
                    if end not in visited:
                        edge = next(
                            (
                                e
                                for e in edge_objects
                                if (
                                    (e.start == node_objects[start].get_center_np())
                                    and (e.end == node_objects[end].get_center_np())
                                )
                                or (
                                    (e.start == node_objects[end].get_center_np())
                                    and (e.end == node_objects[start].get_center_np())
                                )
                            ),
                            None,
                        )
                        if edge:
                            edge.set_color(color)
                            self.play(edge.animate.set_color(color))
                            self.wait(0.25)
                            dfs(end, visited, color)
                            edge.set_color(WHITE)
                            self.play(edge.animate.set_color(WHITE))
                            self.wait(0.25)

            node_objects[start_node].set_fill(BLUE)
            self.play(node_objects[start_node].animate.set_fill(BLUE))
            self.wait(0.5)


        # Run DFS starting from node A
        visited_nodes = set()
        dfs("A", visited_nodes)
        self.wait(2)

        #Reset node colors
        for node in node_objects:
            node_objects[node].set_fill(WHITE)
            self.play(node_objects[node].animate.set_fill(WHITE), run_time=0.25)

        self.wait(1)