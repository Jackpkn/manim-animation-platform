from manim import *

# Set dark background
config.background_color = "#1C1C1C"

class TwoSumIntro(Scene):
    def construct(self):
        # Title
        title = Text("The Two Sum Problem", font_size=48, weight=BOLD)
        title.to_edge(UP)
        self.play(Write(title))

        # Define Data
        array_data = [2, 7, 11, 15]
        target_val = 9
        
        # Visual Elements
        squares = VGroup(*[Square(side_length=1.5, color=TEAL, fill_opacity=0.5) for _ in array_data])
        squares.arrange(RIGHT, buff=0.2)
        
        nums = VGroup(*[Integer(n, font_size=36) for n in array_data])
        for n, s in zip(nums, squares):
            n.move_to(s.get_center())
        
        array_group = VGroup(squares, nums).move_to(ORIGIN)
        
        # Labels
        indices = VGroup(*[Text(str(i), font_size=20, color=GRAY).next_to(sq, DOWN) for i, sq in enumerate(squares)])
        array_label = Text("Input Array (nums)", font_size=24, color=TEAL).next_to(array_group, UP, buff=0.5)

        # Target
        target_box = RoundedRectangle(corner_radius=0.2, height=1.5, width=2.5, color=ORANGE, fill_opacity=0.5)
        target_text = Text(f"Target: {target_val}", font_size=36)
        target_group = VGroup(target_box, target_text).arrange(CENTER).to_edge(DOWN, buff=1)

        # Animation Sequence
        self.play(Create(array_group), FadeIn(indices), Write(array_label))
        self.wait(0.5)
        self.play(DrawBorderThenFill(target_box), Write(target_text))
        self.wait(1)

        # Problem Statement
        problem_text = Tex(r"Find indices $i, j$ such that: \\", r"$nums[i] + nums[j] = \text{Target}$", font_size=36)
        problem_text.next_to(title, DOWN, buff=0.5)
        
        self.play(Write(problem_text))
        self.wait(2)
        
        # Highlight solution briefly
        self.play(
            squares[0].animate.set_color(YELLOW),
            squares[1].animate.set_color(YELLOW),
            run_time=1
        )
        self.play(Indicate(target_text, color=YELLOW))
        self.wait(2)