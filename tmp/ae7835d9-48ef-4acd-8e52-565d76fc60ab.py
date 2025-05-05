from manim import *

# Set dark background
config.background_color = "#1C1C1C"

from manim import *

class DFSAnimation(Scene):
    def construct(self):
        # Define graph nodes and edges
        nodes = {
            'A': (0, 2, 0),
            'B': (-2, 1, 0),
            'C': (2, 1, 0),
            'D': (-3, -1, 0),
            'E': (-1, -1, 0),
            'F': (1, -1, 0),
            'G': (3, -1, 0),
        }

        edges = [
            ('A', 'B'), ('A', 'C'),
            ('B', 'D'), ('B', 'E'),
            ('C', 'F'), ('C', 'G'),
            ('D', 'E'), ('F', 'G')
        ]

        # Create Manim objects for nodes
        node_objects = {
            node: Circle(radius=0.5).move_to(pos) for node, pos in nodes.items()
        }
        node_labels = {
            node: Tex(node).move_to(obj.get_center()) for node, obj in node_objects.items()
        }

        # Create Manim objects for edges
        edge_objects = {}
        for u, v in edges:
            edge_objects[(u, v)] = Line(node_objects[u].get_center(), node_objects[v].get_center())
            edge_objects[(v, u)] = edge_objects[(u,v)] # Treat graph as undirected

        # Add all objects to the scene
        self.play(
            Create(*node_objects.values()),
            Create(*node_labels.values())
        )
        self.play(Create(*edge_objects.values()))
        self.wait(1)

        # DFS traversal function
        def dfs(start_node):
            visited = set()
            stack = [start_node]
            path = [] # for animation

            while stack:
                node = stack.pop()
                if node not in visited:
                    visited.add(node)
                    path.append(node)

                    neighbors = [v for u, v in edges if u == node] + [u for u, v in edges if v == node]
                    neighbors = sorted(neighbors, reverse=True) # for consistent animation

                    for neighbor in neighbors:
                        if neighbor not in visited:
                            stack.append(neighbor)

            return path

        # Run DFS and highlight the path
        dfs_path = dfs('A')
        highlight_color = YELLOW
        animation_duration = 0.5

        self.play(Write(Tex("DFS Traversal:").to_corner(UL)))

        for i in range(len(dfs_path)):
            node = dfs_path[i]
            self.play(
                node_objects[node].animate.set_fill(highlight_color, opacity=1),
                run_time=animation_duration
            )

            if i > 0:
                prev_node = dfs_path[i-1]
                edge = edge_objects.get((prev_node, node)) or edge_objects.get((node, prev_node))
                if edge:
                    self.play(
                        edge.animate.set_color(highlight_color),
                        run_time=animation_duration
                    )

            self.wait(animation_duration)

        self.wait(2)