---
title: Calculus BC
published: 2026-03-15
description: ''
image: ''
tags: ['AP', '微积分', '笔记', '数学']
category: '学习笔记'
draft: false 
lang: ''
---

> 2024.9 - 2025.5

<details>
<summary>目录</summary>

- [一、Limits 极限](#一limits-极限)
- [二、Differentiation 微分](#二differentiation-微分)
- [三、微分的应用](#三微分的应用)
- [四、Integration 积分](#四integration-积分)
- [五、积分的应用](#五积分的应用)

</details>

## 一、Limits 极限

1. 表示趋近的值，如 $ \lim_{x \to \infty} \frac{1}{x} = 0 $.
2. 极限值与函数值的区别：$ f(x) = \begin{cases}
   x &\text{if } x \not = 2 \\
   3 &\text{if } x = 2
\end{cases} $，则 $ f(2) = 3，\lim_{x \to 2} f(x) = 2 $.
3. 左右极限：$ \lim_{x \to c^-} f(x) $ 或 $ \lim_{x \to c^+} f(x) $，分别表示从左趋近 $ c $ 和从右趋近 $ c $，只有二者相等时才可写为 $ \lim_{x \to c} f(x) $，否则极限不存在.
4. 当极限值为 $ \infty $ 或 $ -\infty $ 时，亦称极限不存在.
5. 极限的运算
	1. 极限对函数四则运算均满足分配律，即
		- $ \lim_{x \to c} (f(x) \pm g(x)) = \lim_{x \to c} f(x) \pm \lim_{x \to c} g(x) $
		- $ \lim_{x \to c} (f(x) \cdot g(x)) = \lim_{x \to c} f(x) \cdot \lim_{x \to c} g(x) $
		- $ \lim_{x \to c} \frac{f(x)}{g(x)} = \frac{\lim_{x \to c} f(x)}{\lim_{x \to c} g(x)}, g(x) \not = 0, \lim_{x \to c} g(x) \not = 0 $
	2. 推论：
		- $ \lim_{x \to c} [f(x)]^n = [\lim_{x \to c} f(x)]^n, n > 0 $
6. 判定函数在某点是否连续：若 $ \lim_{x \to c^-} f(x) = \lim_{x \to c^+} f(x) = f(c) $，则 $ f(x) $ 在 $ x = c $ 处连续，否则在 $ x = c $ 处间断.
7. 复合函数（Composite Function）的极限：当 $ f(x) $ 在 $ x = \lim_{x \to c} g(x) $ 处连续时，$ \lim_{x \to c} f(g(x)) = f(\lim_{x \to c} g(x)) $.  
若不连续，设 $ \lim_{x \to c} g(x) = L $，则 $ \lim_{x \to c} f(g(x)) = \lim_{x \to L} f(x) $，并考虑 $ g(x) $ 从哪一侧（上下）趋近 $ L $，由此决定 $ \lim_{x \to L} f(x) $ 中 $ x $ 从哪一侧（右左）趋近 $ L $.
8. $ \lim \frac{1}{0} = \infty $ 或 $ -\infty $（此处 $ 0 $ 为趋近值），$ \lim \frac{1}{\infty} = 0 $.
9. 未定式 $ \lim \frac{0}{0} $（此处 $ 0 $ 为趋近值）：用特殊方法解决，如
	- 先约分再求值
	- 三角极限公式：$ \lim_{x \to 0} \frac{\sin x}{x} = 1 $  
一种用法：$ \lim_{x \to 0} \frac{\sin(4x)}{x} = 4 \times \lim_{x \to 0} \frac{\sin(4x)}{4x} = 4 \times 1 = 4 $
	- 当 $ x \to 0 $ 时，$ \sin x \approx x $，用来计算极限是准确的，如  
   $ \lim_{x \to 0} \frac{\sin(4x)}{x} = \lim_{x \to 0} \frac{4x}{x} = 4 $  
   $ \lim_{x \to \infty} x \cdot \sin \frac{1}{x} = \lim_{x \to \infty} x \cdot \frac{1}{x} = 1 $
10. 未定式 $ \lim \frac{\infty}{\infty} $："找最大"，即分子分母只保留各自的最高次项，如 $ \lim_{x \to \infty} \frac{\sqrt{9x^4-4}}{4+x+x^2} = \lim_{x \to \infty} \frac{3x^2}{x^2} = 3 $.
11. 夹逼定理（Squeeze Theorem）：$ x \in I, g(x) < f(x) < h(x), c \in I, \lim_{x \to c} g(x) = \lim_{x \to c} h(x) = L \Rightarrow \lim_{x \to c} f(x) = L $.
12. 四种间断：
	- 可去间断（Removable Discontinuity）：$ \lim_{x \to c^-} f(x) = \lim_{x \to c^+} f(x) = L, f(c) \not = L $ 或 $ f(c) $ 未定义.
	- 跳跃间断（Jump Discontinuity）：$ \lim_{x \to c^-} f(x) $ 与 $ \lim_{x \to c^+} f(x) $ 都存在且 $ \lim_{x \to c^-} f(x) \not = \lim_{x \to c^+} f(x) $.
	- 无穷间断（Infinite Discontinuity）：$ \lim_{x \to c^-} f(x) = \pm \infty $ 或 $ \lim_{x \to c^+} f(x) = \pm \infty $.
	- 振荡间断（Oscillatory Discontinuity）.
13. 求间断点：
	1. 找间断：无定义点（如分母为 0）、分段点
	2. 求极限（判断间断类型）
14. 渐近线（Asymptote）：
	- 水平渐近线（Horizontal Asymptote）：若 $ \lim_{x \to \infty} f(x) = L $ 或 $ \lim_{x \to -\infty} f(x) = L $，则称直线 $ y = L $ 是 $ f(x) $ 的水平渐近线.
	- 垂直渐近线（Vertical Asymptote）：若 $ \lim_{x \to c} f(x) = \pm \infty $，则称直线 $ x = c $ 为 $ f(x) $ 的垂直渐近线（找分母为零处并验证）.
15. 介值定理（Intermediate Value Theorem, IVT）：若函数 $ f(x) $ 在 $ [a, b] $ 上连续，则存在 $ c \in [a, b] $，使得 $ f(c) $ 的值在 $ f(a) $ 和 $ f(b) $ 之间.

## 二、Differentiation 微分

1. 割线（Secant Line）：过 $ (x_1, f(x_1)), (x_2, f(x_2)) $ 的直线.  
割线斜率：$ \frac{f(x_2)-f(x_1)}{x_2 - x_1} $，表示平均变化率（average rate of change）.
2. 切线（Tangent Line）：$ x_2 = x_1 + \Delta x, \Delta x \to 0 $ 时的割线.  
切线斜率：$ \lim_{\Delta x \to 0} \frac{\Delta y}{\Delta x} = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h} $，表示瞬时变化率（instantaneous rate of change），即导数（Derivative），记作 $ f'(x), y', \frac{{\rm d}y}{{\rm d}x} $ 或 $ \frac{\rm d}{{\rm d}x} [f(x)] $.   
导数的另一种定义形式：$ f'(c) = \lim_{x \to c} \frac{f(x) - f(c)}{x - c} $.
3. 近似求导：$ f'(\frac{a + b}{2}) \approx \frac{f(b) - f(a)}{b - a} $，即用割线斜率估计中点切线斜率（越近越好）.
4. 用导数定义求 $ f(x)= x^2 $ 的导数：  
$ \begin{aligned} f'(x) &= \lim_{h \to 0} \frac{(x+h)^2-x^2}{h} \\ 
&= \lim_{h \to 0} \frac{2xh + h^2}{h} \\ 
&= \lim_{h \to 0} (2x + h) \\ 
&= 2x. \end{aligned} $
5. 常数求导：
	- $ \frac{\rm d}{{\rm d}x}[c] = 0 $
	- $ \frac{\rm d}{{\rm d}x}[c \cdot f(x)] = c \cdot f'(x) $
6. 常用导数公式：
	- $ (x^n)' = nx^{n-1} $
	- $ (a^x)' = a^x \ln a $，$ ({\rm e}^x)' = e^x $
	- $ (\log_{a} x)' = \frac{1}{x \ln a} $，$ (\ln x)' = \frac{1}{x} $
	- $ (\sin x)' = \cos x $，$ (\arcsin x)' = \frac{1}{\sqrt{1 - x^2}} $
	- $ (\cos x)' = -\sin x $，$ (\arccos x)' = -\frac{1}{\sqrt{1 - x^2}} $
	- $ (\tan x)' = \sec^2 x = \frac{1}{\cos^2 x} $，$ (\arctan x)' = \frac{1}{1 + x^2} $
	- $ (\cot x)' = -\csc^2 x = -\frac{1}{\sin^2 x} $，$ (\text{arccot}\, x)' = -\frac{1}{1 + x^2} $
7. 导数的四则运算：
	- $ \frac{\rm d}{{\rm d}x}[f(x) \pm g(x)] = f'(x) \pm g'(x) $
	- $ \frac{\rm d}{{\rm d}x}[f(x) \cdot g(x)] = f'(x) \cdot g(x) + f(x) \cdot g'(x) $
	- $ \frac{\rm d}{{\rm d}x}[\frac{f(x)}{g(x)}] = \frac{f'(x) \cdot g(x) - f(x) \cdot g'(x)}{[g(x)]^2}, g(x) \not = 0 $
8. 可导（Differentiability）：函数在某点连续且左右变化率存在且相等，则称函数在该点可导.  
形式化地，若 $ \lim_{x \to c^-} f(x) = \lim_{x \to c^+} f(x) = f(c) $ 且 $ \lim_{x \to c^-} \frac{f(x) - f(c)}{x - c} = \lim_{x \to c^+} \frac{f(x) - f(c)}{x - c} \not = \pm \infty $，则称 $ f(x) $ 在 $ x = c $ 处可导.
9. 复合函数求导：
	1. $ f'(g(x)) $ 表示什么：设 $ f'(x) = h(x) $，则 $ f'(g(x)) = h(g(x)) $.
	2. 方法：链式法则（Chain Rule），有以下几种等价的表示形式  
		- $ \frac{{\rm d}}{{\rm d}x} [f(g(x))] = f'(g(x)) \cdot g'(x) $
		- 令 $ u = g(x) $，则 $ \frac{{\rm d}}{{\rm d}x} [f(u)] = f'(u) \cdot u' $
		- 令 $ y = f(g(x)), u = g(x) $，则 $ \frac{{\rm d}y}{{\rm d}x} = \frac{{\rm d}y}{{\rm d}u} \cdot \frac{{\rm d}u}{{\rm d}x} $
	3. 链式法则的证明：  
	$ \begin{aligned} \frac{{\rm d}}{{\rm d}x} [f(g(x))] &= \lim_{h \to 0} \frac{f(g(x + h)) - f(g(x))}{h} \\
&= \lim_{h \to 0} \left( \frac{f(g(x + h)) - f(g(x))}{g(x + h) - g(x)} \cdot \frac{g(x + h) - g(x)}{h} \right) \\
&= \lim_{h \to 0} \frac{f(g(x + h) - f(g(x))}{g(x + h) - g(x)} \cdot \lim_{h \to 0} \frac{g(x + h) - g(x)}{h} \\
&= f'(g(x)) \cdot g'(x). \end{aligned} $
10. 隐函数（Implicit Function）求导：
	1. 隐函数：隐函数是指那些不是显式给出 $ y $ 关于 $ x $ 的函数的方程。通常，隐函数通过一个方程 $ F(x, y) = 0 $ 定义，如单位圆方程 $ x^2 + y^2 - 1 = 0 $.
	2. 方法：对方程的每一项求导，其中 $ y $ 是 $ x $ 的函数，导数是 $ \frac{{\rm d}y}{{\rm d}x} $，最后解方程得到 $ \frac{{\rm d}y}{{\rm d}x} $.
	3. 举例：若 $ x^2 + y^2 - 1 = 0 $，对每一项求导，得 $ 2x + 2y \cdot \frac{{\rm d}y}{{\rm d}x} = 0 $，解得 $ \frac{{\rm d}y}{{\rm d}x} = -\frac{x}{y} $.
11. 反函数（Inverse Function）求导：
	1. 反函数：$ y = f(x) $ 的反函数为 $ x = f(y) $，记作 $ y = f^{-1}(x) $，图像与 $ y = f(x) $ 关于直线 $ y = x $ 对称.
	2. 方法：$ \frac{{\rm d}}{{\rm d}x} [f^{-1}(x)] = \frac{1}{f'(f^{-1}(x))} $.
	3. 证明：对 $ x = f(y) $ 求导，得 $ 1 = f'(y) \cdot \frac{{\rm d}y}{{\rm d}x} \implies \frac{{\rm d}y}{{\rm d}x} = \frac{1}{f'(y)} = \frac{1}{f'(f^{-1}(x))} $.
12. 高阶导数：
	1. 表示：
		- $ y'', f''(x), \frac{{\rm d}^2 y}{{\rm d}x^2}, \frac{{\rm d}^2}{{\rm d}x} [f(x)] $
		- $ y''', f'''(x), \frac{{\rm d}^3 y}{{\rm d}x^3}, \frac{{\rm d}^3}{{\rm d}x^3} [f(x)] $
		- $ y^{(n)}, f^{(n)}(x), \frac{{\rm d}^n y}{{\rm d}x^n}, \frac{{\rm d}^n}{{\rm d}x^n} [f(x)] $
		- 为什么是 $ \frac{{\rm d}^n y}{{\rm d}x^n} $ 而不是 $ \frac{{\rm d}y^n}{{\rm d}x^n} $ 或 $ \frac{{\rm d}^n y}{{\rm d}^n x} $：以二阶导举例，$ f''(x) = \frac{{\rm d}\frac{{\rm d}y}{{\rm d}x}}{{\rm d}x} = \frac{{\rm d}^2 y}{{\rm d}^2 x^2} $，为了简便，写为 $ \frac{{\rm d}^2 y}{{\rm d}x^2} $.
	2. 隐函数的高阶导数：重复使用隐函数求导，其中 $ \left(\frac{{\rm d}^n y}{{\rm d}x^n}\right)' = \frac{{\rm d}^{n+1} y}{{\rm d}x^{n+1}} $.
13. 参数方程（Parametric Equations）求导：
	1. 参数方程：$ x = f(t), \ y = g(t) $.
	2. 求一阶导：$ \frac{{\rm d}y}{{\rm d}x} = \frac{{\rm d}y / {\rm d}t}{{\rm d}x / {\rm d}t} = \frac{g'(t)}{f'(t)} $.
	3. 求二阶导：$ \frac{{\rm d}^2 y}{{\rm d}x^2} = \frac{{\rm d}y' / {\rm d}t}{{\rm d}x / {\rm d}t} $.

## 三、微分的应用

1. 相关变化率（Related Rate）问题：
	1. 基础形态：$ x, \, y $ 都与 $ t $ 有关（ $ x = g(t), \, y = f(t) $），已知 $ y = f(x) $ 及某一时刻 $ x  $、$ \frac{{\rm d}x}{{\rm d}t} $ 与 $ \frac{{\rm d}y}{{\rm d}t} $ 中的两个值，求第三个值.
	2. 举例：向倒置圆锥中以一定速率倒水，求液面高度为某值时液面高度的增加速率.
	3. 方法：将 $ y = f(x) $ 中的 $ x, \, y $ 分别对 $ t $ 求导，得 $ \frac{{\rm d}y}{{\rm d}t} = f'(x) \cdot \frac{{\rm d}x}{{\rm d}t} $，代入已知量即可求出未知量.
2. 线性近似（Linear Approximation）：已知函数某点斜率，用过该点切线估计函数其他点.  
公式：$ f(b) \approx f(a) + f'(a) \cdot (a-b) $
3. 洛必达法则（L'Hospital's Rule）：
	1. 对象：未定式.
	2. 若 $ \lim_{x \to c} f(c) = \lim_{x \to c} g(c) = 0 $ 或 $ \lim_{x \to c} f(c) = \lim_{x \to c} g(c) = \infty $，则 $ \lim_{x \to c} \frac{f(x)}{g(x)} = \lim_{x \to c} \frac{f'(x)}{g'(x)} $.
4. 拉格朗日中值定理（Lagrange's Mean Value Theorem, MVT）：若函数 $ f(x) $ 在 $ [a, b] $ 上连续且在 $ (a, b) $ 上可导，则存在 $ c \in (a, b) $，使得 $ f'(c) = \frac{f(a) - f(b)}{a - b} $.
5. 最值定理（Extreme Value Theorem, EVT）：若函数在区间 $ [a, b] $ 连续，则该函数在区间 $ [a, b] $ 内必存在最大值和最小值.
6. 导数与函数的性质：
	1. 函数的单调性与临界点（Critical Point）：
		- $ \forall x \in (a, b), \ f'(x) > 0 \implies f(x) $ 在区间 $ (a, b) $ 上单调递增（increase）.
		- $ \forall x \in (a, b), \ f'(x) < 0 \implies f(x) $ 在区间 $ (a, b) $ 上单调递减（decrease）.
		- $ f'(c) = 0 $ 或 $ f'(c) $ 不存在，则称点 $ (c, f(c)) $ 为函数 $ f(x) $ 的临界点.
		- 函数 $ f(x) $ 在区间 $ (a, b) $ 上单调递增的充分必要条件是：$
\forall x \in (a, b), \ f'(x) \geq 0 $，且 $ f'(x) > 0 $ 在任意非空开子区间上至少有一个点成立.
	2. 函数的凹凸性（Concavity）与拐点（Point of Inflection）：
		- $ \forall x \in (a, b), \ f''(x) > 0 \implies f(x) $ 在区间 $ (a, b) $ 上下凹（concave up）.
		- $ \forall x \in (a, b), \ f''(x) < 0 \implies f(x) $ 在区间 $ (a, b) $ 上上凸（concave down）.
		- $ f''(c) = 0 $ 且 $ f'''(c) \not = 0 $，则称点 $ (c, f(c)) $ 为函数 $ f(x) $ 的拐点.  
		通俗地说，二阶导正负变化（同时一阶导增减变化）.
	3. 函数的极值（Relative/Local Extremum）：
		- $ f'(c) = 0 $ 且 $ f''(c) > 0 $，则称函数 $ f(x) $ 在点 $ (c, f(c)) $ 取到极小值.  
		通俗地说，一阶导先负后正.
		- $ f'(c) = 0 $ 且 $ f''(c) < 0 $，则称函数 $ f(x) $ 在点 $ (c, f(c)) $ 取到极大值.  
		通俗地说，一阶导先正后负.
	4. 函数的最值（Absolute/Global Extremum）：
		- 函数某一区间内的**边界值**与所有**极大值**的**最大值**称为函数在该区间的**最大值**.
		- 函数某一区间内的**边界值**与所有**极小值**的**最小值**称为函数在该区间的**最小值**.

## 四、Integration 积分

1. 函数 $ f(x) $ 在区间 $ [a, b] $ 围成的图形：指函数 $ f(x) $ 的图像、$ x $ 轴、直线 $ x = a $ 与直线 $ x = b \ (a < b)$ 围成的图形，若某部分图像在 $ x $ 轴下方，则该部分围成的有向面积取负值.
2. 求函数 $ f(x) $ 在区间 $ [a, b] $ 围成的图形的有向面积：  
该部分所有面积均指有向面积.
	1. 近似面积：
		1. 梯形和（Trapezoidal Sum）：将图形近似分割成若干个梯形，将每个梯形面积相加求出.  
		若梯形的底所在直线分别为直线 $ x = x_1 $ 与直线 $ x = x_2 \ (x_1 < x_2) $，则该梯形面积为 $ \frac{(f(x_1) + f(x_2)) \cdot (x_2 - x_1)}{2} $.
		2. 黎曼和（Riemann Sum）：将图形近似分割成若干个矩形，将每个矩形面积相加求出.  
		若矩形的两条竖直边所在直线分别为直线 $ x = x_1 $ 与直线 $ x = x_2 \ (x_1 < x_2) $，根据矩形高度选取的不同可分为以下三种黎曼和：
			- 左黎曼和（Left Riemann Sum）：取 $ f(x_1) $ 作为矩形的高度，该矩形面积为 $ (x_1 - x_2) \cdot f(x_1) $.
			- 右黎曼和（Right Riemann Sum）：取 $ f(x_2) $ 作为矩形的高度，该矩形面积为 $ (x_1 - x_2) \cdot f(x_2) $.
			- 中点黎曼和（Midpoint Riemann Sum）：取 $ f(\frac{x_1 + x_2}{2}) $ 作为矩形的高度，该矩形面积为 $ (x_1 - x_2) \cdot f(\frac{x_1 + x_2}{2}) $.
	2. 准确面积：将区间 $ [a, b] $ 用等分成 $ n $ 份，设第 $ k $ 份的右端点为 $ x_k $，每份长度为 $ \Delta x $，当 $ n \to \infty $ 时，用右黎曼和计算图形准确面积为 $ \lim_{n \to \infty} \sum_{k = 1}^n f(x_k) \Delta x $，仅用 $ f(x) $、$ a $、$ b $ 表达为 $ \lim_{n \to \infty} \sum_{k = 1}^n f(a + k \frac{b - a}{n}) \cdot \frac{b - a}{n} $.
3. 定积分（Definite Integral）：$ \int_a^b f(x) \, {\rm d}x $. 
	- 当 $ a < b $ 时，$ \int_a^b f(x) \, {\rm d}x $ 即为函数 $ f(x) $ 在区间 $ [a, b] $ 围成的图形的有向面积.
	- 当 $ a > b $ 时，$ \int_a^b f(x) \, {\rm d}x = -\int_b^a f(x) \, {\rm d}x $.
	- 当 $ a = b $ 时，$ \int_a^b f(x) \, {\rm d}x = 0 $.
4. 对 $ {\rm d}x $ 的理解：
	- $ {\rm d}x $ 不仅仅是一个标记，还是积分中的重要组成部分，是一个参与运算的量.
	- $ {\rm d}x $ 表示变量 $ x $ 的一个微小增量，从几何上看，这对应于 $ x $ 轴上一个无限小的长度.
	- 在积分的计算中，$ {\rm d}x $ 是积分求和时的分割单位，它让我们可以对函数 $ f(x) $ 在一个区间上进行“累加”.
	- 例如，定积分 $ \int_a^b f(x) \, {\rm d}x $ 可以看成是把区间 $ [a, b] $ 分成无数个微小的部分，每部分的宽度是 $ {\rm d}x $，然后将每个部分的函数值 $ f(x) $ 乘以宽度 $ {\rm d}x $ 并累加得到总面积。
	- 此外，在积分中，$ {\rm d}x $ 还起到标记作用，明确告诉我们积分变量是 $ x $. 如果函数有多个变量（比如 $ f(x, y) $），需要指定积分是对哪个变量进行的，例如 $ \int f(x, y) \, {\rm d}x $ 是对 $ x $ 进行积分，而 $ {\rm d}y $ 则表示对 $ y $ 积分.
5. 定积分的性质：
	- $ \int_a^b k f(x) \, {\rm d}x = k \int_a^b f(x) \, {\rm d}x $
	- $ \int_a^b (f(x) \pm g(x)) \, {\rm d}x = \int_a^b f(x) \, {\rm d}x \pm \int_a^b g(x) \, {\rm d}x $
	- $ \int_a^b f(x) \, {\rm d}x + \int_b^c f(x) \, {\rm d}x = \int_a^c f(x) \, {\rm d}x $
6. 定积分与函数的奇偶性：
	- 若 $ f(x) $ 是奇函数，则 $ \int_{-a}^a f(x) \, {\rm d}x = 0 $.
	- 若 $ f(x) $ 是偶函数，则 $ \int_{-a}^a f(x) \, {\rm d}x = 2 \int_0^a f(x) \, {\rm d}x $.
7. 不定积分（Indefinite Integral）：$ \int f(x) \, {\rm d}x = F(x) + C $，其中 $ F'(x) = f(x) $.
8. 常用不定积分公式：
	- $ \int k f(x) \, {\rm d}x = k \int f(x) \, {\rm d}x $
	- $ \int (f(x) \pm g(x)) \, {\rm d}x = \int f(x) \, {\rm d}x \pm \int g(x) \, {\rm d}x $
	- $ \int x^n \, {\rm d}x = \frac{x^{n + 1}}{n + 1} + C \ (n \not = -1)，\int k \, {\rm d}x = k x + C $
	- $ \int \frac{1}{x} \, {\rm d}x = \ln |x| + C $
	- $ \int a^x \, {\rm d}x = \frac{a^x}{\ln a} + C $，$ \int {\rm e}^x \, {\rm d}x = {\rm e}^x + C $
	- $ \int \sin x \, {\rm d}x = -\cos x + C $，$ \int \cos x \, {\rm d}x = \sin x + C $
	- $ \int \sec^2 x \, {\rm d}x = \tan x + C $，$ \int \csc^2 x \, {\rm d}x = -\cot x + C $
	- $ \int \sec x \tan x \, {\rm d}x = \sec x + C $，$ \int \csc x \cot x \, {\rm d}x = -\csc x + C $
	- $ \int \frac{1}{\sqrt{1 - x^2}} {\rm d}x = \arcsin x + C $，$ \int \frac{1}{1 + x^2} {\rm d}x = \arctan x + C $
	- $ \int \frac{1}{\sqrt{a^2 - x^2}} {\rm d}x = \arcsin \frac{x}{a} + C $，$ \int \frac{1}{a^2 + x^2} {\rm d}x = \frac{1}{a} \arctan \frac{x}{a} + C $
9. 牛顿-莱布尼茨公式（Newton-Leibniz Formula）：设函数 $ F(x) $ 满足 $ F'(x) = f(x) $，则  
$ \begin{aligned} \int_a^b f(x) \, {\rm d}x & = [F(x) + C]_a^b \\
& = [F(b) + C] - [F(a) + C] \\
& = F(b) - F(a).
\end{aligned} $  
用于计算定积分.
10. 变限积分/积分函数（Integral Function）：
	1. 定义：自变量为定积分上限或下限的函数
		- 变上限积分函数（Integral Function with Variable Upper Limit）：$ F(x) = \int_a^x f(t) \, {\rm d}t $.
		- 变下限积分函数（Integral Function with Variable Lower Limit）：$ F(x) = \int_x^b f(t) \, {\rm d}t $.
		- 由于 $ \int_x^b f(t) \, {\rm d}t = -\int_b^x f(t) \, {\rm d}t $，以下只讨论变上限积分函数.
	2. 求导：$ [\int_a^x f(t) \, {\rm d}t]' = f(x) $.
	3. 复合积分函数求导：链式法则，$ [\int_a^{f(x)} g(t) \, {\rm d}t]' = g(f(x)) \cdot f'(x) $.
11. 常见积分方法：
	1. 配凑法：尝试直接配凑出 $ F(x) $，使 $ F'(x) $ 为被积函数.  
		1. 举例：求 $ \int e^{2x} \, {\rm d}x $.  
		$ \because (e^{2x})' = 2 e^{2x} $  
		$ \therefore (\frac{1}{2} e^{2x})' = e^{2x} $  
		$ \therefore \int e^{2x} \, {\rm d}x = \frac{1}{2} e^{2x} + C $.
		2. 常用推论：
			- $ \int \frac{1}{ax + k} \, {\rm d}x = \frac{1}{a} \ln |ax + k| + C $
			- $ \int \frac{1}{\sqrt{a^2 - (x + k)^2}} {\rm d}x = \arcsin \frac{x + k}{a} + C $，$ \int \frac{1}{a^2 + (x + k)^2} {\rm d}x = \frac{1}{a} \arctan \frac{x + k}{a} + C $
	2. 处理分式的常用方法：
		- 长除法.
		- 配方法：若分子是常数，可将分母配成 $ \sqrt{a^2 - (x + k)^2} $ 或 $ a^2 + (x + k)^2 $ 的形式，从而积分成反三角函数.
		- 因式拆分法：$ \frac{(A + B)x + Ab + Ba}{(x + a)(x + b)} = \frac{A}{x + a} + \frac{B}{x + b} $，如 $ \frac{3x + 7}{x^2 + 5x + 6} = \frac{1}{x + 2} + \frac{2}{x + 3} $.
	3. 换元法：
		1. 不定积分：
			1. 重要结论：$ \frac{{\rm d}f(x)}{{\rm d}x} = f'(x) \implies {\rm d}f(x) = f'(x) \, {\rm d}x $.  
			可理解为 $ f(x) $ 的微小变化是 $ f'(x) $ 与 $ x $ 的微小增量 $ {\rm d}x $ 的乘积.
			2. 方法：令 $ u $ 为被积函数的一部分，用 $ x $ 和 $ {\rm d}x $ 表示 $ {\rm d}u $，将积分转化为 $ k \int g(u) \, {\rm d}u $.
			3. 举例：
				1. 求 $ \int \sin x \cos x \, {\rm d}x $.  
				令 $ u = \sin x $，则 $ {\rm d}u = \cos x \, {\rm d}x $.  
				$ \begin{aligned} \therefore 原式 & = \int u \, {\rm d}u \\
				& = \frac{1}{2} u^2 + C \\
				& = \frac{1}{2} \sin^2 x + C.
				\end{aligned} $
				2. 求 $ \int x (x^2 - 1) \, {\rm d}x $.  
				令 $ u = x^2 - 1 $，则 $ {\rm d}u = 2x \, {\rm d}x $.  
				$ \begin{aligned} \therefore 原式 & = \int \frac{1}{2} u \, {\rm d}u \\
				& = \frac{1}{2} \int u \, {\rm d}u \\
				& = \frac{1}{4} u^2 + C \\
				& = \frac{1}{4} (x^2 - 1)^2 + C.
				\end{aligned} $
				3. 求 $ \int x^2 (x^3 - 1)^{10} \, {\rm d}x $.  
				令 $ u = x^3 - 1 $，则 $ {\rm d}u = 3x^2 \, {\rm d}x $.  
				$ \begin{aligned} \therefore 原式 & = \int \frac{1}{3} u^{10} \, {\rm d}u \\
				& = \frac{1}{3} \int u^{10} \, {\rm d}u \\
				& = \frac{1}{33} u^{11} + C \\
				& = \frac{1}{33} (x^3 - 1)^{11} + C.
				\end{aligned} $
			4. 本质：$ \int g(f(x)) f'(x) \, {\rm d}x = \int g(f(x)) \, {\rm d}f(x) $.  
			换元法即令 $ u = f(x) $，则 $ \int g(f(x)) f'(x) \, {\rm d}x = \int g(u) \, {\rm d}u $，可理解为将 $ x $ 的微小变化转化为 $ u $ 的微小变化，从而完成积分变量的转换.
		2. 定积分：需要变换上下限，$ \int_a^b g(f(x)) f'(x) \, {\rm d}x = \int_{f(a)}^{f(b)} g(f(x)) \, {\rm d}f(x) $，或换元后为 $ \int_{f(a)}^{f(b)} g(u) \, {\rm d}u $.
	4. 分部积分法：
		1. 对象：$ \int f(x) g(x) \, {\rm d}x $.
		2. 重要结论：  
		$ \because (uv)' = u'v + uv' $  
		$ \therefore \int (uv)' \, {\rm d}x = \int u'v \, {\rm d}x + \int uv' \, {\rm d}x $  
		$ \because u' \, {\rm d}x = {\rm d}u, \ v' \, {\rm d}x = {\rm d}v $  
		$ \therefore uv = \int v \, {\rm d}u + \int u \, {\rm d}v $  
		$ \therefore \int u \, {\rm d}v = uv - \int v \, {\rm d}u $.
		3. 方法：  
		令 $ u = f(x), \ v = \int g(x) \, {\rm d}x $，  
		则 $ {\rm d}u = f'(x) \, {\rm d}x, \ {\rm d}v = g(x) \, {\rm d}x $.  
		$ \begin{aligned} \therefore 原式 & = \int u \, {\rm d}v \\
		& = uv - \int v \, {\rm d}u \\
		& = f(x) \int g(x) \, {\rm d}x - \int \left(\int g(x) \, {\rm d}x\right)f'(x) \, {\rm d}x.
		\end{aligned} $
		4. $ f(x) $ 与 $ g(x) $ 的选取：$ f(x) $ 方便求导，$ g(x) $ 方便积分，从而简化原积分式.
		5. 更易操作的方法：  
		$ \def\arraystretch{1.5}
		\begin{array}{c:c}
		\mathrlap{\raisebox{-0.08em}{\ 1}}{\bigcirc} f(x) & \mathrlap{\raisebox{-0.08em}{\ 2}}{\bigcirc} g(x) \\ \hdashline
		\mathrlap{\raisebox{-0.08em}{\ 3}}{\bigcirc} f'(x) & \mathrlap{\raisebox{-0.08em}{\ 4}}{\bigcirc} \int g(x) \, {\rm d}x \\
		\end{array} $  
		$ 原式 = \mathrlap{\raisebox{-0.08em}{\ 1}}{\bigcirc} \mathrlap{\raisebox{-0.08em}{\ 4}}{\bigcirc} - \int \mathrlap{\raisebox{-0.08em}{\ 3}}{\bigcirc} \mathrlap{\raisebox{-0.08em}{\ 4}}{\bigcirc} \, {\rm d}x $.
		6. 举例：求 $ \int x \ln x \, {\rm d}x $.  
		$ \def\arraystretch{1.5}
		\begin{array}{c:c}
		\ln x & x \\ \hdashline
		\frac{1}{x} & \frac{x^2}{2} \\
		\end{array} $  
		$ \begin{aligned} 原式 & = \frac{x^2}{2} \ln x - \int \frac{1}{x} \cdot \frac{x^2}{2} \, {\rm d}x \\
		& = \frac{x^2}{2} \ln x - \int \frac{x}{2} \, {\rm d}x \\
		& = \frac{1}{2} x^2 \ln x - \frac{1}{4} x^2.
		\end{aligned} $
12. 反常积分（Improper Integral）：上限或下限含 $ \infty $ 或无穷间断点的定积分.
	1. 计算：
		- $ \int_a^{\infty} f(x) \, {\rm d}x = \lim_{b \to \infty} \int_a^b f(x) \, {\rm d}x $
		- $ \int_{-\infty}^b f(x) \, {\rm d}x = \lim_{a \to -\infty} \int_a^b f(x) \, {\rm d}x $
		- $ \int_{-\infty}^{\infty} f(x) \, {\rm d}x = \int_{-\infty}^c f(x) \, {\rm d}x + \int_c^{\infty} f(x) \, {\rm d}x $
		- 若函数 $ f(x) $ 在区间 $ [a, b) $ 连续且 $ x = b $ 是 $ f(x) $ 的一个无穷间断点，则 $ \int_a^b f(x) \, {\rm d}x = \lim_{c \to b^-} \int_a^c f(x) \, {\rm d}x $
		- 若函数 $ f(x) $ 在区间 $ (a, b] $ 连续且 $ x = a $ 是 $ f(x) $ 的一个无穷间断点，则 $ \int_a^b f(x) \, {\rm d}x = \lim_{c \to a^+} \int_c^b f(x) \, {\rm d}x $
	2. 敛散性：
		- 若反常积分存在，则称积分收敛（Converge）.
		- 若反常积分不存在（如 $ \pm \infty $、$ \ln 0 $ 等），则称积分发散（Diverge）.

## 五、积分的应用

1. 微分方程（Differential Equation）：
	1. 定义：形如 $ \frac{{\rm d}y}{{\rm d}x} = f(x, y) $ 的关于 $ y $ 的方程.
	2. 解法：
		1. 验证法.
		2. 斜率场（Slope Field）：在 $ (x, y) $ 处画斜率为 $ \frac{{\rm d}y}{{\rm d}x} $ 的小短线.
			1. 判断微分方程对应的斜率场：
				- 若 $ \frac{{\rm d}y}{{\rm d}x} = (x - a)(y - b) $，则直线 $ x = a $ 和 $ y = b $ 出现斜率全为 $ 0 $ 的小短线.
				- $ x $ 次数为奇常伴随斜率场关于 $ y $ 轴对称，次数为偶常伴随斜率场 $ y $ 轴左右两侧全等.
				- 代入特殊点直接判断.
			2. 作用：画函数大致图像.
		3. 欧拉法则（Euler's Method）：多次线性近似，已知 $ f'(x) $ 和 $ f(a) $，求 $ f(b) $，可在 $ [a, b] $ 中均匀地取 $ n - 1 $ 个点，将 $ a, \ b $ 分别看成第 $ 0 $ 个点和第 $ n $ 个点，则 $ f(k) = f(k - 1) + \frac{b - a}{n} f'(k - 1) $.
		4. 分离变量（Separation of Variable）：将 $ x $ 和 $ y $ 分别整理至等号两侧，同时积分.  
		举例：
			1. 解关于 $ y $ 的方程 $ \frac{{\rm d}y}{{\rm d}x} = 5y^2 $.  
			$ \begin{aligned} \frac{1}{y^2} \, {\rm d}y & = 5 \, {\rm d}x \\
			\int \frac{1}{y^2} \, {\rm d}y & = \int 5 \, {\rm d}x \\
			-\frac{1}{y} & = 5x + C \\
			y & = -\frac{1}{5x + C}.
			\end{aligned} $
			2. 已知 $ \begin{aligned} \varepsilon - \frac{{\rm d}q}{{\rm d}t} R - \frac{q}{C} = 0 \end{aligned} $，其中 $ \varepsilon $、$ R $ 和 $ C $ 为常数，$ t = 0 $ 时，$ q = 0 $，求 $ q $ 关于 $ t $ 的函数.  
			$ \begin{aligned} {\rm d}t & = RC \frac{{\rm d}q}{\varepsilon C - q} \\
			\int {\rm d}t & = \int RC \frac{{\rm d}q}{\varepsilon C - q} \\
			t & = -RC \ln(\varepsilon C - q) + C_1 \\
			q & = \varepsilon C - e^{\frac{C_1}{RC}} \cdot e^{-\frac{t}{RC}}.
			\end{aligned} $  
			代入 $ t = 0,\ q = 0 $，得 $ \begin{aligned} 0 = \varepsilon C - e^{\frac{C_1}{RC}} \end{aligned} $，因此 $ \begin{aligned} e^{\frac{C_1}{RC}} = \varepsilon C \end{aligned} $  
			综上，$ \begin{aligned} q = \varepsilon C - \varepsilon C e^{-\frac{t}{RC}} = \varepsilon C (1 - e^{-\frac{t}{RC}}) \end{aligned} $
	3. 相关模型：
		1. 指数模型（Exponential Model）：$ \frac{{\rm d}y}{{\rm d}t} = ky \implies y = {\rm e}^{kt + C} $，例如无限制的人口增长.  
		图像特点：增长速度一直增加.
		2. 逻辑模型（Logistic Model）：$ \frac{{\rm d}y}{{\rm d}t} = ky (1 - \frac{y}{L}) \implies y = \frac{L A {\rm e}^{kt}}{1 + A {\rm e}^{kt}} \ (A = {\rm e}^C) $，例如有限制的人口增长，其中 $ L $ 表示环境承载力（Carrying Capacity）.  
		图像特点：增长先变快后变慢（先凹后凸），拐点为图像与直线 $ y = \frac{L}{2} $ 的交点，直线 $ y = L $ 为水平渐近线.
2. 函数 $ f(x) $ 在区间 $ [a, b] $ 的平均值（Average Value）：$ \frac{1}{b - a} \int_a^b f(x) \, {\rm d}x $.
3. 积分与实际问题：变化率的积分表示变化量，即 $ \int_a^b f'(x) \, {\rm d}x = f(b) - f(a) $.
4. 积分与面积：
	1. 函数 $ f(x) $ 与 $ g(x) $ 的图像在区间 $ [a, b] $ 围成的面积 $ [f(x) > g(x)] $：
		1. 割补法：$ S = \int_a^b f(x) \, {\rm d}x - \int_a^b g(x) \, {\rm d}x = \int_a^b [f(x) - g(x)] \, {\rm d}x $.
		2. 微元法：$ S = \lim_{n \to \infty} \sum_{k = 1}^n [f(a + k \frac{b - a}{n}) - g(a + k \frac{b - a}{n})] \cdot \frac{b - a}{n} = \int_a^b [f(x) - g(x)] \, {\rm d}x $.
	2. 横向微元：  
	举例：求 $ y^2 = 3 - x $ 与 $ y = x - 1 $ 的图像围成的面积.  
	两图像交点为 $ (-1, -2) $ 和 $ (2, 1) $，将竖直方向的区间 $ [-2, 1] $ 等分为 $ n $ 份，即将待求图形分为 $ n $ 个高度相等的矩形，设第 $ k $ 个矩形的上端点为 $ y_k $，每个矩形高度为 $ \Delta y $，将两个图像分别用函数 $ x = f(y) = 3 - y^2 $ 和 $ x = g(y) = y + 1 $ 表示，当 $ n \to \infty $ 时，即可得到面积 $ S = \lim_{n \to \infty} \sum_{k = 1}^n [f(y_k) - g(y_k)] \Delta y = \int_{-2}^1 [f(y) - g(y)] \, {\rm d}y = \frac{9}{2} $.
5. 积分与体积：将物体微分成无数个截面再积分，如若截面都垂直于 $ x $ 轴，则 $ V = \int_a^b A(x) \ {\rm d}x $，其中 $ A(x) $ 表示截面横坐标为 $ x $ 时截面的面积.  
举例：平面直角坐标系中，顶点为 $ (0, 0), \ (0, 4), \ (8, 0) $ 的三角形是一个物体的一个底，该物体所有垂直于 $ x $ 轴的截面均为半圆，则 $ x $ 处半圆的半径为 $ -\frac{1}{2} x + 2 $，面积 $ A(x) = \frac{1}{2} \pi \left(-\frac{1}{2} x + 2 \right)^2 $，该物体体积 $ V = \int_0^8 \frac{1}{2} \pi \left(-\frac{1}{2} x + 2 \right)^2 {\rm d}x \approx 16.755 $.
6. 求图像长度：将图像微分，每一份长度都是 $ \sqrt{({\rm d}x)^2 + ({\rm d}y)^2} $，因此 $ f(x) $ 的图像从 $ x = a $ 到 $ x = b $ 部分的长度为：  
$ \begin{aligned} & \int_a^b \sqrt{({\rm d}x)^2 + ({\rm d}y)^2} \\
= & \int_a^b \sqrt{({\rm d}x)^2 + (f'(x) \ {\rm d}x)^2} \\
= & \int_a^b \sqrt{({\rm d}x)^2 (1 + (f'(x))^2} \\
= & \int_a^b \sqrt{1 + (f'(x))^2} \ {\rm d}x. \\
\end{aligned} $
7. 参数方程图像长度：与 (6) 同理，长度为 $ \int_a^b \sqrt{(f'(t))^2 + (g'(t))^2} \ {\rm d}t $.
8. 极坐标系（Polar Coordinate System）：
	1. 极坐标与横纵坐标的转化：
		1. $ x = r \cos \theta, \ y = r \sin \theta $
		2. $ r = \sqrt{x^2 + y^2}, \ \tan \theta = \frac{y}{x} $
	2. 求函数 $ r = f(\theta) $ 的图像在 $ (r, \theta) $ 处的斜率：  
	$ x = f(\theta) \cos \theta, \ y = f(\theta) \sin \theta $  
	$ \begin{aligned} \frac{{\rm d}y}{{\rm d}x} & = \frac{{\rm d}y / {\rm d}\theta}{{\rm d}x / {\rm d}\theta} \\
	& = \frac{(f(\theta) \sin \theta)'}{(f(\theta) \cos \theta)'} \\
	& = \frac{f'(\theta) \sin \theta + f(\theta) \cos \theta}{f'(\theta) \cos \theta - f(\theta) \sin \theta}.
	\end{aligned} $
	3. 求函数 $ r = f(\theta) $ 的图像、直线 $ \theta = \alpha $ 和直线 $ \theta = \beta \ (0 < \beta - \alpha < 2 \pi) $ 围成图形的面积 $ A $：  
	将图像微分成若干个扇形，每个扇形的圆心角为 $ {\rm d}\theta $，半径 $ r = f(\theta) $，则扇形面积为 $ \frac{1}{2} r^2 {\rm d}\theta = \frac{1}{2} f^2(\theta) \ {\rm d}\theta $，对所有扇形积分，可得总面积 $ A = \int_{\alpha}^{\beta} \frac{1}{2} f^2(\theta) \ {\rm d}\theta = \frac{1}{2} \int_{\alpha}^{\beta} f^2(\theta) \ {\rm d}\theta $.
	4. 求函数 $ r = f(\theta) $ 的图像、$ r = g(\theta) $ 的图像、直线 $ \theta = \alpha $ 和直线 $ \theta = \beta \ (0 < \beta - \alpha < 2 \pi, \ f(\theta) > g(\theta)) $ 围成图形的面积 $ A $：  
	$ A = \frac{1}{2} \int_{\alpha}^{\beta} f^2(\theta) \ {\rm d}\theta - \frac{1}{2} \int_{\alpha}^{\beta} g^2(\theta) \ {\rm d}\theta = \frac{1}{2} \int_{\alpha}^{\beta} (f^2(\theta) - g^2(\theta)) \ {\rm d}\theta $.
9. 级数（Series）：
	1. 定义：数列的前 $ n $ 项和.
	2. 条件收敛（Conditionally Converge）和绝对收敛（Absolutely Converge）：
		- 若 $ \sum_{n = 1}^{\infty} |a_n| $ 收敛，则称 $ \sum_{n = 1}^{\infty} a_n $ 绝对收敛.
		- 若 $ \sum_{n = 1}^{\infty} a_n $ 收敛而 $ \sum_{n = 1}^{\infty} |a_n| $ 发散，则称 $ \sum_{n = 1}^{\infty} a_n $ 条件收敛.
	3. 判断收敛/发散：
		1. 等比级数（Geometric Series）判别法：若 $ {a_n} $ 是首项为 $ a (a \not = 0) $、公比为 $ r $ 的等比数列，
			- 若 $ |r| < 1 $，则 $ \sum_{n = 1}^{\infty} a_n $ 收敛于 $ \frac{a}{1 - r} $.
			- 若 $ |r| \ge 1 $，则 $ \sum_{n = 1}^{\infty} a_n $ 发散.
		2. $ n $ 项检验法（The $n$th Term Test）：若 $ \lim_{n \to \infty} a_n $ 不为零或不存在，则 $ \sum_{n = 1}^{\infty} a_n $ 发散.  
		或表述为逆否命题：若 $ \sum_{n = 1}^{\infty} a_n $ 收敛，则 $ \lim_{n \to \infty} a_n = 0 $.
		3. 积分法（Integral Test）：设 $ a_n = f(n) $ 且 $ x \ge 1 $ 时，$ f(x) $ 恒为正、连续且递减，则 $ \sum_{n = 1}^{\infty} a_n $ 与 $ \int_1^{\infty} f(x) \ {\rm d}x $ 敛散性一致.
		4. 调和级数（Harmonic Series）与 $p$-级数（$p$-series）：
			1. 调和级数：$ \sum_{n = 1}^{\infty} \frac{1}{n} $.
			2. $p$-级数：$ \sum_{n = 1}^{\infty} \frac{1}{n^p} $.
			3. 结论：
				- 若 $ p > 1 $，则 $ \sum_{n = 1}^{\infty} \frac{1}{n^p} $ 收敛.  
				- 若 $ 0 < p \le 1 $，则 $ \sum_{n = 1}^{\infty} \frac{1}{n^p} $ 发散.
			4. 证明：积分法.
			5. 拓展：若 $ a_n $ 的分子和分母均为多项式，且分母次数大于分子次数，则可以"找最大"，即分子分母只保留各自的最高次项，从而转化为 $p$-级数.
		5. 比较法：
			1. 直接比较法（Direct Comparison Test）：若对所有 $ n $ 都有 $ 0 < a_n \le b_n $，则
				- 若 $ \sum_{n = 1}^{\infty} b_n $ 收敛，则 $ \sum_{n = 1}^{\infty} a_n $ 收敛（大收敛推小收敛）.
				- 若 $ \sum_{n = 1}^{\infty} a_n $ 发散，则 $ \sum_{n = 1}^{\infty} b_n $ 发散（小发散推大发散）.
			2. 极限比较法（Limit Comparison Test）：若 $ {a_n} $ 和 $ {b_n} $ 的每一项都为正且 $ \lim_{n \to \infty} \frac{a_n}{b_n} $ 存在且为正，则 $ \sum_{n = 1}^{\infty} a_n $ 与 $ \sum_{n = 1}^{\infty} b_n $ 敛散性一致.
		6. 交替级数判别法（Alternating Series Test）：
			1. 交替级数：每一项正负交替出现的级数，即 $ \sum_1^{\infty} (-1)^n a_n $ 或 $ \sum_1^{\infty} (-1)^{n + 1} a_n $
			2. 若 $ \lim_{n \to \infty} a_n = 0 $ 且对所有 $ n $ 都有 $ a_{n + 1} \le a_n $（此处 $ a_n $ 的意义与上述相同），则该级数收敛.
		7. 比值法（Ratio Test）：
			- 若 $ \lim_{n \to \infty} |\frac{a_{n + 1}}{a_n}| < 1 $，则 $ \sum_{n = 1}^{\infty} a_n $ 绝对收敛.
			- 若 $ \lim_{n \to \infty} |\frac{a_{n + 1}}{a_n}| > 1 $，则 $ \sum_{n = 1}^{\infty} a_n $ 发散.
	4. 交替级数误差（Alternating Series Error Bound）：设 $ {a_n} $ 是一个交替级数，则 $ |\sum_{n = 0}^{\infty} a_n - \sum_{n = 0}^{k} a_n| \le |a_{k + 1}| $（用前 $ k $ 项估计则误差不超过第 $ k + 1 $ 项）.
	5. 泰勒级数（Taylor Series）：
		1. 定义：函数 $ f(x) $ 在 $ x = c $ 处的 $ n $ 阶（$n$th-degree）泰勒级数 $ P_n(x) = \sum_{k = 0}^n \frac{f^{(k)}(c)}{k!} (x - c)^k $，当 $ n \to \infty $ 时，$ P_n(x) = f(x) $，此时每一点的泰勒级数都相等.
		2. 用途：将任意函数表示成多项式函数，便于求积分等.
		3. 麦克劳林级数（Maclaurin Series）：函数 $ f(x) $ 在 $ x = 0 $ 处的泰勒级数，即 $ \sum_{k = 0}^n \frac{f^{(k)}(0)}{k!} x^k $.
		4. 常用函数的麦克劳林级数：
			- $ e^x = \sum_{n = 0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots + \frac{x^n}{n!} + \cdots $
			- $ \sin x = \sum_{n = 0}^{\infty} (-1)^n \frac{x^{2n + 1}}{(2n + 1)!} = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots + (-1)^n \frac{x^{2n + 1}}{(2n + 1)!} + \cdots $
			- $ \cos x = \sum_{n = 0}^{\infty} (-1)^n \frac{x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots + (-1)^n \frac{x^{2n}}{(2n)!} + \cdots $
			- $ \frac{1}{1 - x} = \sum_{n = 0}^{\infty} x^n = 1 + x + x^2 + x^3 + \cdots + x^n + \cdots $
			- $ \frac{1}{1 + x} = \sum_{n = 0}^{\infty} (-1)^n x^n = 1 - x + x^2 - x^3 + \cdots + (-1)^n x^n + \cdots $
		5. 运算：泰勒级数本质上是函数，故其四则运算与复合运算与函数相同，但计算 $ n $ 阶泰勒级数时若算出高于 $ n $ 次方的项则舍弃.
		6. 拉格朗日误差（Lagrange Error Bound）：用 $ n $ 阶泰勒级数拟合 $ f(x) $ 产生的误差，记为 $ R_n(x) $，即 $ R_n(x) = f(x) - P_n(x) $.  
		重要结论：$ |R_n(x)| \le \frac{f^{(n + 1)}(z)}{(n + 1)!} (x - c)^{n + 1} $，其中 $ z $ 为 $ f^{(n + 1)}(x) $ 在 $ x $ 与 $ c $ 之间的极大值点.
	6. 收敛区间（Interval of Converge）：使含自变量的级数收敛的自变量的取值范围.  
	举例：求级数 $ \frac{(x - 1)^n}{n} $ 的收敛区间.  
	使用比值法  
	$ \begin{aligned} \lim_{n \to \infty} \left\lvert \frac{\frac{(x - 1)^{n + 1}}{n + 1}}{\frac{(x - 1)^n}{n}} \right\rvert = \lim_{n \to \infty} \left\lvert \frac{(x - 1) n}{n + 1} \right\rvert = |x - 1| \end{aligned} $  
	由于收敛，$ |x - 1| < 1 \implies 0 < x < 2 $  
	分别使用交替级数判别法和 $p$-级数判定 $ x = 0 $ 和 $ x = 2 $ 时级数的敛散性，可得级数收敛区间为 $ [0, 2) $.
	7. 收敛半径（Radius of Converge）：收敛区间长度的一半.