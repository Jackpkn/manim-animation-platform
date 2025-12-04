from manim import *

config.background_color = "#1C1C1C"

class IntroExample(Scene):
    def construct(self):
        title = Text("Manim Project Editor", font_size=48)
        self.play(Write(title))
        self.wait(1)