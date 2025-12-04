from manim import *

# Set dark background
config.background_color = "#1C1C1C"

class TwoSumBruteForce(Scene):
    def construct(self):
        # --- 1. SETUP & CONFIGURATION ---
        # Colors
        COLOR_DEFAULT = BLUE
        COLOR_HIGHLIGHT = YELLOW
        COLOR_SUCCESS = GREEN
        COLOR_FAIL = RED
        COLOR_TEXT = WHITE
        
        # Data
        array_nums = [2, 7, 11, 15]
        target_value = 9
        
        # --- 2. CREATE STATIC UI ELEMENTS ---
        # Title
        title = Text("Two Sum Problem", font_size=48).to_edge(UP)
        subtitle = Text("Brute Force Approach", font_size=32, color=GREY).next_to(title, DOWN)
        
        # Target Display
        target_label = Text(f"Target: {target_value}", font_size=36, color=GOLD)
        target_label.to_corner(UL).shift(DOWN * 0.5)
        
        # --- 3. CREATE ARRAY VISUALIZATION ---
        squares = VGroup()
        num_texts = VGroup()
        
        # Create squares and numbers
        for n in array_nums:
            sq = Square(side_length=1.2, color=COLOR_DEFAULT)
            num = Integer(n, font_size=40, color=COLOR_TEXT)
            num.move_to(sq.get_center())
            squares.add(sq)
            num_texts.add(num)
        
        # Group square and number together, arrange them horizontally
        array_group = VGroup(*[VGroup(s, n) for s, n in zip(squares, num_texts)])
        array_group.arrange(RIGHT, buff=0.2)
        array_group.move_to(ORIGIN).shift(UP * 0.5)
        
        # --- 4. CREATE POINTERS ---
        # Pointer I
        pointer_i = Arrow(start=UP, end=DOWN, color=TEAL).scale(0.5)
        label_i = MathTex("i", color=TEAL).next_to(pointer_i, UP, buff=0.1)
        group_i = VGroup(pointer_i, label_i)
        
        # Pointer J
        pointer_j = Arrow(start=UP, end=DOWN, color=PURPLE).scale(0.5)
        label_j = MathTex("j", color=PURPLE).next_to(pointer_j, UP, buff=0.1)
        group_j = VGroup(pointer_j, label_j)
        
        # Helper to position pointers
        def move_pointer_to_index(pointer_group, index):
            target_square = squares[index]
            pointer_group.next_to(target_square, UP, buff=0.2)
            return pointer_group

        # --- 5. ANIMATION SEQUENCE ---
        
        # Intro
        self.play(Write(title), FadeIn(subtitle))
        self.play(Write(target_label))
        self.play(Create(squares), Write(num_texts))
        self.wait(1)
        
        # Dynamic Equation Placeholder
        equation_text = MathTex("? + ? = ?", font_size=48).next_to(array_group, DOWN, buff=1.0)
        self.play(Write(equation_text))
        
        found = False
        
        # --- LOOP LOGIC ---
        for i in range(len(array_nums)):
            if found: break
            
            # Initialize Pointer i
            move_pointer_to_index(group_i, i)
            if i == 0:
                self.play(FadeIn(group_i))
            else:
                self.play(group_i.animate.next_to(squares[i], UP, buff=0.2), run_time=0.5)
            
            for j in range(i + 1, len(array_nums)):
                val_i = array_nums[i]
                val_j = array_nums[j]
                current_sum = val_i + val_j
                
                # Initialize Pointer j
                move_pointer_to_index(group_j, j)
                if j == i + 1:
                    if i == 0 and j == 1: # First time appearing
                        self.play(FadeIn(group_j))
                    else:
                        # If restarting j loop, fade in or quick move
                        self.play(FadeIn(group_j, shift=DOWN), run_time=0.5)
                else:
                    self.play(group_j.animate.next_to(squares[j], UP, buff=0.2), run_time=0.5)
                
                # Highlight current squares
                sq_i = squares[i]
                sq_j = squares[j]
                self.play(
                    sq_i.animate.set_stroke(COLOR_HIGHLIGHT, width=6),
                    sq_j.animate.set_stroke(COLOR_HIGHLIGHT, width=6),
                    run_time=0.3
                )
                
                # Update Equation
                new_equation = MathTex(
                    f"{val_i} + {val_j} = {current_sum}", 
                    font_size=48
                ).move_to(equation_text)
                
                self.play(Transform(equation_text, new_equation))
                self.wait(0.5)
                
                # Check Condition
                if current_sum == target_value:
                    # SUCCESS STATE
                    self.play(
                        sq_i.animate.set_fill(COLOR_SUCCESS, opacity=0.5).set_stroke(COLOR_SUCCESS),
                        sq_j.animate.set_fill(COLOR_SUCCESS, opacity=0.5).set_stroke(COLOR_SUCCESS),
                        equation_text.animate.set_color(COLOR_SUCCESS)
                    )
                    
                    # Success Message
                    match_text = Text("Match Found!", color=COLOR_SUCCESS, font_size=36)
                    match_text.next_to(equation_text, DOWN)
                    indices_text = Text(f"Indices: [{i}, {j}]", font_size=24)
                    indices_text.next_to(match_text, DOWN)
                    
                    box = SurroundingRectangle(equation_text, color=COLOR_SUCCESS, buff=0.2)
                    
                    self.play(Write(match_text), FadeIn(indices_text), Create(box))
                    found = True
                    break
                else:
                    # FAILURE STATE
                    # Shake effect on text or flash red
                    self.play(
                        equation_text.animate.set_color(COLOR_FAIL),
                        sq_i.animate.set_stroke(COLOR_FAIL),
                        sq_j.animate.set_stroke(COLOR_FAIL),
                        run_time=0.2
                    )
                    self.wait(0.2)
                    
                    # Reset styling
                    self.play(
                        equation_text.animate.set_color(WHITE),
                        sq_i.animate.set_stroke(COLOR_DEFAULT, width=4),
                        sq_j.animate.set_stroke(COLOR_DEFAULT, width=4),
                        run_time=0.2
                    )
        
        # --- 6. CONCLUSION ---
        self.wait(2)
        self.play(FadeOut(group_i), FadeOut(group_j), FadeOut(title), FadeOut(subtitle), FadeOut(target_label))