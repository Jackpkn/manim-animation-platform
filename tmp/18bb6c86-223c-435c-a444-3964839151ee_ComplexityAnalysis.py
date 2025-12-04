from manim import *

# Set dark background
config.background_color = "#1C1C1C"

class ComplexityAnalysis(Scene):
    def construct(self):
        # Brute Force Section
        bf_title = Text("Brute Force Approach", font_size=36, color=RED).to_edge(UP)
        bf_code = Code(
            code="""
for i in range(n):
  for j in range(i+1, n):
    for k in range(j+1, n):
      for l in range(k+1, n):
        check_sum()""",
            tab_width=2,
            background="window",
            language="python",
            font="Monospace",
            insert_line_no=False,
            style="monokai",
        ).scale(0.8).move_to(LEFT * 3)
        
        bf_complexity = MathTex("O(N^4)", color=RED, font_size=60).next_to(bf_code, DOWN)
        
        self.play(Write(bf_title))
        self.play(FadeIn(bf_code))
        self.play(Write(bf_complexity))
        self.wait(1.5)
        
        # Transition to Optimized
        arrow = Arrow(start=LEFT, end=RIGHT, color=WHITE).move_to(ORIGIN)
        opt_title = Text("Optimized Approach", font_size=36, color=GREEN).to_edge(UP)
        
        opt_steps = VGroup(
            Text("1. Sort the Array", font_size=24),
            Text("2. Fix indices i and j", font_size=24),
            Text("3. Two Pointers (Left/Right) for k and l", font_size=24)
        ).arrange(DOWN, aligned_edge=LEFT).move_to(RIGHT * 3.5)
        
        opt_complexity = MathTex("O(N^3)", color=GREEN, font_size=60).next_to(opt_steps, DOWN, buff=0.5)

        self.play(
            ReplacementTransform(bf_title, opt_title),
            FadeOut(bf_code),
            FadeOut(bf_complexity),
            FadeIn(opt_steps),
            FadeIn(opt_complexity)
        )
        self.wait(2)
        
        note = Text("Sorting takes O(N log N), Loops take O(N^3)", font_size=20, color=GREY)
        note.to_edge(BOTTOM)
        self.play(Write(note))
        self.wait(2)