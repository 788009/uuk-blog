---
title: Microeconomics Manim Code
published: 2026-04-25
description: ' '
image: ''
tags: []
category: ''
draft: false 
lang: ''
---

- [quota.gif](#quotagif)
- [good-and-factor-market.gif](#good-and-factor-marketgif)

## quota.gif

```python
from manim import *

class QuotaModel(Scene):
    def construct(self):
        # ==========================================
        # 1. 绘制坐标轴 (Axes)
        # ==========================================
        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 10, 1],
            x_length=8,
            y_length=7,
            axis_config={"include_tip": True, "include_numbers": False}
        )
        labels = axes.get_axis_labels(x_label="Q", y_label="P")
        
        self.play(Create(axes), Write(labels))

        # 设定关键参数与交点坐标
        p_D_start = axes.c2p(0, 9)
        p_D_end = axes.c2p(9, 0)
        
        p_S_start = axes.c2p(0, 1)
        p_S_end = axes.c2p(8, 9)
        
        p_w_start = axes.c2p(0, 3)
        p_w_end = axes.c2p(9, 3)
        q_s1_point = axes.c2p(2, 3) # Supply 与 World Price 交点
        
        q_s1_plus_quota = axes.c2p(4, 3) # 配额终点
        
        p_S_prime_start = axes.c2p(4, 3)
        p_S_prime_end = axes.c2p(10, 9)
        
        actual_eq_point = axes.c2p(5, 4)
        p_q_start = axes.c2p(0, 4)
        p_q_end = axes.c2p(9, 4)

        # ==========================================
        # 2. 绘制 Demand 和 Supply
        # ==========================================
        demand_line = Line(p_D_start, p_D_end, color=BLUE)
        demand_label = Text("Demand", color=BLUE, font_size=20).move_to(axes.c2p(9, 1.5))
        
        supply_line = Line(p_S_start, p_S_end, color=YELLOW)
        supply_label = Text("Supply", color=YELLOW, font_size=20).move_to(axes.c2p(8.5, 8.5))
        
        self.play(Create(demand_line), Write(demand_label))
        self.play(Create(supply_line), Write(supply_label))

        # ==========================================
        # 3. 绘制 World price 并处理竞争力 (交叉淡入淡出)
        # ==========================================
        world_price_line = Line(p_w_start, p_w_end, color=WHITE)
        world_price_label = Text("World price", color=WHITE, font_size=20).next_to(world_price_line, RIGHT)
        
        self.play(Create(world_price_line), Write(world_price_label))
        self.wait(0.5)

        # 定义新线
        supply_lower = Line(p_S_start, q_s1_point, color=YELLOW)
        supply_upper_dashed = DashedLine(q_s1_point, p_S_end, color=YELLOW)
        new_supply = VGroup(supply_lower, supply_upper_dashed)
        
        wp_part1_dashed = DashedLine(p_w_start, q_s1_point, color=WHITE)
        wp_part2_solid = Line(q_s1_point, p_w_end, color=WHITE)
        new_wp_step1 = VGroup(wp_part1_dashed, wp_part2_solid)

        # 修改点：使用 FadeOut 和 FadeIn 同步执行，实现平滑的 Crossfade 效果
        self.play(
            FadeOut(supply_line), FadeOut(world_price_line),
            FadeIn(new_supply), FadeIn(new_wp_step1),
            run_time=0.8
        )
        self.wait(0.5)

        # ==========================================
        # 4. 绘制 Quota 并处理 World price 耗尽 (交叉淡入淡出)
        # ==========================================
        quota_brace = BraceBetweenPoints(q_s1_point, q_s1_plus_quota, direction=DOWN)
        quota_label = quota_brace.get_text("Quota")
        
        self.play(Create(quota_brace), Write(quota_label))
        self.wait(0.5)

        # 为避免动画引用冲突，重新创建第二阶段的三段世界价格线
        wp2_part1_dashed = DashedLine(p_w_start, q_s1_point, color=WHITE)
        wp2_part2_active = Line(q_s1_point, q_s1_plus_quota, color=WHITE)
        wp2_part3_dashed = DashedLine(q_s1_plus_quota, p_w_end, color=WHITE)
        new_wp_step2 = VGroup(wp2_part1_dashed, wp2_part2_active, wp2_part3_dashed)

        # 同样使用同步 Fade 实现平滑过渡
        self.play(
            FadeOut(new_wp_step1), FadeIn(new_wp_step2),
            run_time=0.8
        )
        self.wait(0.5)

        # ==========================================
        # 5. 绘制 Supply'
        # ==========================================
        supply_prime_line = Line(p_S_prime_start, p_S_prime_end, color=YELLOW_D)
        supply_prime_label = Text("Supply'", color=YELLOW_D, font_size=20).move_to(axes.c2p(10.5, 8.5))
        
        self.play(Transform(DashedLine(q_s1_point, p_S_end, color=YELLOW), supply_prime_line), Write(supply_prime_label))
        self.wait(0.5)

        # ==========================================
        # 5.5 标出实际均衡点
        # ==========================================
        eq_dot = Dot(actual_eq_point, color=RED)
        self.play(Create(eq_dot))
        self.wait(0.5)

        # ==========================================
        # 6. 绘制 Actual price
        # ==========================================
        actual_price_line = Line(p_q_start, p_q_end, color=WHITE)
        actual_price_label = Text("Actual price", color=WHITE, font_size=20).next_to(actual_price_line, RIGHT)
        
        self.play(Create(actual_price_line), Write(actual_price_label))
        self.wait(0.5)
        self.play(FadeOut(eq_dot))

        # ==========================================
        # 7. 动态体现三段逻辑与平移
        # ==========================================
        seg1_line = Line(axes.c2p(0, 0), axes.c2p(2, 0), color=YELLOW, stroke_width=8)
        seg1_text = Text("1. 国内优先", font="SimHei", font_size=16, color=YELLOW).next_to(seg1_line, DOWN)
        
        seg2_line = Line(axes.c2p(2, 0), axes.c2p(4, 0), color=PURPLE, stroke_width=8)
        seg2_text = Text("2. 配额进口", font="SimHei", font_size=16, color=PURPLE).next_to(seg2_line, DOWN)
        
        seg3_line = Line(axes.c2p(4, 0), axes.c2p(5, 0), color=ORANGE, stroke_width=8)
        seg3_text = Text("3. 国内重新入场", font="SimHei", font_size=16, color=ORANGE).next_to(axes.c2p(5, 0), DOWN)
        
        # 高亮 Supply' 上实际成交的段
        s_prime_active = Line(axes.c2p(4, 3), axes.c2p(5, 4), color=ORANGE, stroke_width=6)

        self.play(Create(seg1_line), Write(seg1_text))
        self.play(Create(seg2_line), Write(seg2_text))
        self.play(Create(seg3_line), Write(seg3_text), Create(s_prime_active))
        self.wait(1)
        
        # 将第三段供给平移回原供给曲线，证明 PS 的组成
        s_active_target = Line(axes.c2p(2, 3), axes.c2p(3, 4), color=ORANGE, stroke_width=6)
        self.play(Transform(s_prime_active, s_active_target))
        self.wait(1)

        # 移除辅助文字，保留 s_prime_active 作为 PS 边界
        self.play(
            FadeOut(seg1_line), FadeOut(seg1_text),
            FadeOut(seg2_line), FadeOut(seg2_text),
            FadeOut(seg3_line), FadeOut(seg3_text),
            FadeOut(quota_brace), FadeOut(quota_label)
        )

        # ==========================================
        # 8. 填充 Surplus 和 Deadweight Loss
        # ==========================================
        
        # Consumer Surplus
        cs_polygon = Polygon(
            axes.c2p(0, 4), axes.c2p(0, 9), axes.c2p(5, 4),
            fill_color=GREEN, fill_opacity=0.5, stroke_width=0
        )
        cs_label = Text("Consumer\nSurplus", font_size=22).move_to(axes.c2p(1.4, 6))
        
        self.play(FadeIn(cs_polygon), Write(cs_label))
        self.wait(1)

        # Producer Surplus
        ps_polygon = Polygon(
            axes.c2p(0, 1), axes.c2p(3, 4), axes.c2p(0, 4),
            fill_color=ORANGE, fill_opacity=0.5, stroke_width=0
        )
        ps_label = Text("Producer\nSurplus", font_size=22, line_spacing=0.8).move_to(axes.c2p(1.2, 2.2))
        
        self.play(FadeIn(ps_polygon), Write(ps_label))
        self.wait(1)

        # Deadweight Loss
        dwl_left = Polygon(
            axes.c2p(2, 3), axes.c2p(3, 4), axes.c2p(3, 3),
            fill_color=RED, fill_opacity=0.6, stroke_width=0
        )
        
        dwl_right = Polygon(
            axes.c2p(5, 4), axes.c2p(6, 3), axes.c2p(5, 3),
            fill_color=RED, fill_opacity=0.6, stroke_width=0
        )
        
        dwl_label = Text("Deadweight Loss", font_size=22, color=RED).move_to(axes.c2p(4, 1.5))
        
        arrow_left = Arrow(start=dwl_label.get_top(), end=axes.c2p(2.7, 3.5), color=RED, buff=0.1, tip_length=0.15)
        arrow_right = Arrow(start=dwl_label.get_top(), end=axes.c2p(5.3, 3.6), color=RED, buff=0.1, tip_length=0.15)
        
        self.play(FadeIn(dwl_left), FadeIn(dwl_right), Write(dwl_label), GrowArrow(arrow_left), GrowArrow(arrow_right))
        self.wait(3)
```

## good-and-factor-market.gif

```python
from manim import *

class MarketFlip(Scene):
    def construct(self):
        # ==========================================
        # 1. 绘制坐标轴 (Axes)
        # ==========================================
        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 10, 1],
            x_length=8,
            y_length=7,
            axis_config={"include_tip": True, "include_numbers": False}
        )
        labels_product = axes.get_axis_labels(x_label="Q", y_label="P")
        
        self.play(Create(axes), Write(labels_product))

        # ==========================================
        # 2. 定义商品市场 (Product Market) 函数
        # ==========================================
        # Demand 和 MR 起点下调至 y=9
        def demand_func(x): return 9 - x
        def mr_func(x): return 9 - 2 * x
        def mc_func(x): return 1 + 0.5 * x
        def atc_func(x): return 0.2 * (x - 6)**2 + 4

        demand_curve = axes.plot(demand_func, x_range=[0, 8.5], color=BLUE)
        mr_curve = axes.plot(mr_func, x_range=[0, 4.3], color=BLUE_D)
        mc_curve = axes.plot(mc_func, x_range=[0, 10], color=YELLOW)
        atc_curve = axes.plot(atc_func, x_range=[1, 10], color=YELLOW_D)

        # 曲线标签
        demand_label = Text("Price = Demand", color=BLUE, font_size=18).move_to(axes.c2p(9, 1.5))
        mr_label = Text("MR", color=BLUE_D, font_size=18).move_to(axes.c2p(4.5, 1))
        mc_label = Text("MC", color=YELLOW, font_size=18).move_to(axes.c2p(10, 5.5))
        atc_label = Text("ATC", color=YELLOW_D, font_size=18).move_to(axes.c2p(9.2, 7))

        # 改变动画出场顺序，先 MC/ATC，后 Demand/MR
        self.play(Create(mc_curve), Create(atc_curve), Write(mc_label), Write(atc_label))
        self.play(Create(demand_curve), Create(mr_curve), Write(demand_label), Write(mr_label))
        self.wait(0.5)

        # ==========================================
        # 3. 商品市场均衡分析 (MC = MR)
        # ==========================================
        # 交点坐标计算: 9 - 2x = 1 + 0.5x => 2.5x = 8 => x = 3.2
        # MC(3.2) = 2.6, Demand(3.2) = 5.8
        eq_q = 3.2
        eq_p = 5.8
        mc_mr_y = 2.6
        
        # Demand 与 MC 的交点（用于计算 DWL 三角形的右侧顶点）
        # 9 - x = 1 + 0.5x => 1.5x = 8 => x ≈ 5.33, y ≈ 3.67
        dwl_right_x = 5.33
        dwl_right_y = 3.67

        mc_mr_dot = Dot(axes.c2p(eq_q, mc_mr_y), color=RED)
        self.play(Create(mc_mr_dot))

        # 垂直辅助线至 Demand 曲线，并延伸至坐标轴
        v_line_prod = DashedLine(axes.c2p(eq_q, mc_mr_y), axes.c2p(eq_q, eq_p), color=WHITE)
        v_line_down = DashedLine(axes.c2p(eq_q, mc_mr_y), axes.c2p(eq_q, 0), color=WHITE)
        h_line_prod = DashedLine(axes.c2p(eq_q, eq_p), axes.c2p(0, eq_p), color=WHITE)
        
        q0_label = MathTex("Q_0", font_size=24).next_to(axes.c2p(eq_q, 0), DOWN)
        p0_label = MathTex("P_0", font_size=24).next_to(axes.c2p(0, eq_p), LEFT)

        self.play(Create(v_line_prod), Create(v_line_down))
        self.play(Create(h_line_prod), Write(q0_label))
        self.play(Write(p0_label))
        self.wait(0.5)

        # 绘制 CS, PS, DWL
        cs_poly = Polygon(axes.c2p(0, eq_p), axes.c2p(0, 9), axes.c2p(eq_q, eq_p), fill_color=GREEN, fill_opacity=0.5, stroke_width=0)
        ps_poly = Polygon(axes.c2p(0, 1), axes.c2p(eq_q, mc_mr_y), axes.c2p(eq_q, eq_p), axes.c2p(0, eq_p), fill_color=ORANGE, fill_opacity=0.5, stroke_width=0)
        dwl_poly = Polygon(axes.c2p(eq_q, eq_p), axes.c2p(eq_q, mc_mr_y), axes.c2p(dwl_right_x, dwl_right_y), fill_color=RED, fill_opacity=0.6, stroke_width=0)

        cs_text = Text("Consumer\nSurplus", font_size=18).move_to(axes.c2p(1.1, 6.5))
        ps_text = Text("Producer\nSurplus", font_size=18).move_to(axes.c2p(1.1, 3.8))
        
        # DWL 文字直接居中放置在红区内部，白色字体，不要箭头
        dwl_text = Text("DWL", color=WHITE, font_size=14).move_to(axes.c2p(4.0, 4.0))

        self.play(FadeIn(cs_poly), Write(cs_text))
        self.play(FadeIn(ps_poly), Write(ps_text))
        self.play(FadeIn(dwl_poly), Write(dwl_text))
        self.wait(2)

        # ==========================================
        # 4. 隐去辅助元素，准备垂直翻转
        # ==========================================
        elements_to_fade = [
            mc_mr_dot, v_line_prod, v_line_down, h_line_prod, q0_label, p0_label,
            cs_poly, ps_poly, dwl_poly, cs_text, ps_text, dwl_text,
            demand_label, mr_label, mc_label, atc_label, labels_product
        ]
        self.play(*[FadeOut(obj) for obj in elements_to_fade], run_time=1)

        # ==========================================
        # 5. 要素市场 (Factor Market) - 垂直翻转变换
        # ==========================================
        # 新坐标轴标签
        labels_factor = axes.get_axis_labels(x_label="L", y_label="W")
        
        # 定义翻转后的函数： y_new = 10 - y_old
        # 验证：10 - (9 - x) = 1 + x，起点完美从 (0, 1) 开始
        def supply_func(x): return 1 + x                        # 翻转 Demand: 10 - (9 - x)
        def mfc_func(x): return 1 + 2 * x                       # 翻转 MR: 10 - (9 - 2x)
        def mrp_func(x): return 9 - 0.5 * x                     # 翻转 MC: 10 - (1 + 0.5x)
        def arp_func(x): return 6 - 0.2 * (x - 6)**2            # 翻转 ATC: 10 - (0.2(x-6)^2 + 4)

        supply_curve = axes.plot(supply_func, x_range=[0, 8.5], color=BLUE)
        mfc_curve = axes.plot(mfc_func, x_range=[0, 4.3], color=BLUE_D)
        mrp_curve = axes.plot(mrp_func, x_range=[0, 10], color=YELLOW)
        arp_curve = axes.plot(arp_func, x_range=[1, 10], color=YELLOW_D)

        # 核心动画：四条曲线同步平滑翻转，展现数学镜像关系
        self.play(
            Write(labels_factor),
            Transform(demand_curve, supply_curve),
            Transform(mr_curve, mfc_curve),
            Transform(mc_curve, mrp_curve),
            Transform(atc_curve, arp_curve),
            run_time=2
        )
        self.wait(0.5)

        # 新曲线标签
        supply_label = Text("Wage = Supply", color=BLUE, font_size=18).move_to(axes.c2p(9.5, 9.1))
        mfc_label = Text("MFC", color=BLUE_D, font_size=18).move_to(axes.c2p(4.6, 9.2))
        mrp_label = Text("MRP", color=YELLOW, font_size=18).move_to(axes.c2p(9.5, 4.8))
        arp_label = Text("ARP", color=YELLOW_D, font_size=18).move_to(axes.c2p(9.2, 3))

        self.play(Write(supply_label), Write(mfc_label), Write(mrp_label), Write(arp_label))

        # ==========================================
        # 6. 要素市场均衡分析 (MFC = MRP)
        # ==========================================
        # 交点依然在 x = 3.2 处
        # MFC(3.2) = 7.4, Supply(3.2) = 4.2
        eq_l = 3.2
        eq_w = 4.2
        mfc_mrp_y = 7.4
        
        # Supply 与 MRP 交点，用于 DWL 的右侧顶点
        # 1 + x = 9 - 0.5x => 1.5x = 8 => x ≈ 5.33, y ≈ 6.33
        dwl_f_right_y = 6.33

        mfc_mrp_dot = Dot(axes.c2p(eq_l, mfc_mrp_y), color=RED)
        self.play(Create(mfc_mrp_dot))

        # 向下延伸至 Supply 曲线以确定工资
        v_line_factor = DashedLine(axes.c2p(eq_l, mfc_mrp_y), axes.c2p(eq_l, eq_w), color=WHITE)
        v_line_down_factor = DashedLine(axes.c2p(eq_l, eq_w), axes.c2p(eq_l, 0), color=WHITE)
        h_line_factor = DashedLine(axes.c2p(eq_l, eq_w), axes.c2p(0, eq_w), color=WHITE)

        l0_label = MathTex("L_0", font_size=24).next_to(axes.c2p(eq_l, 0), DOWN)
        w0_label = MathTex("W_0", font_size=24).next_to(axes.c2p(0, eq_w), LEFT)

        self.play(Create(v_line_factor))
        self.play(Create(v_line_down_factor))
        self.play(Create(h_line_factor), Write(l0_label))
        self.play(Write(w0_label))
        self.wait(0.5)

        # ==========================================
        # 7. 绘制要素市场的 CS, PS, DWL
        # ==========================================
        cs_poly_factor = Polygon(axes.c2p(0, 9), axes.c2p(eq_l, mfc_mrp_y), axes.c2p(eq_l, eq_w), axes.c2p(0, eq_w), fill_color=GREEN, fill_opacity=0.5, stroke_width=0)
        ps_poly_factor = Polygon(axes.c2p(0, 1), axes.c2p(eq_l, eq_w), axes.c2p(0, eq_w), fill_color=ORANGE, fill_opacity=0.5, stroke_width=0)
        dwl_poly_factor = Polygon(axes.c2p(eq_l, mfc_mrp_y), axes.c2p(eq_l, eq_w), axes.c2p(dwl_right_x, dwl_f_right_y), fill_color=RED, fill_opacity=0.6, stroke_width=0)

        cs_text_factor = Text("Consumer\nSurplus", font_size=16).move_to(axes.c2p(1.1, 6.2))
        ps_text_factor = Text("Producer\nSurplus", font_size=16).move_to(axes.c2p(1.1, 3.2))
        
        # 要素市场的 DWL 标签同样居中白色无箭头
        dwl_text_factor = Text("DWL", color=WHITE, font_size=14).move_to(axes.c2p(3.8, 6.0))

        self.play(FadeIn(cs_poly_factor), Write(cs_text_factor))
        self.play(FadeIn(ps_poly_factor), Write(ps_text_factor))
        self.play(FadeIn(dwl_poly_factor), Write(dwl_text_factor))
        self.wait(3)
```
