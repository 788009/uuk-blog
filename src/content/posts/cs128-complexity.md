---
title: cs128.org 代码 Complexity 计算机制
published: 2026-09-16
description: ''
image: ''
tags: ['C++', 'CS 128', '折腾']
category: '技术'
draft: false 
lang: ''
---

## 背景

UIUC CS 128 课程使用 [cs128.org](https://cs128.org/)，其代码题的评测系统有时会计算函数的 Complexity，例如在第 4 周的 Command-line Arguments 一课中，Complexity 的阈值为 $10$，若某函数的 Complexity 超过 $10$ 则扣分。

网站没有给出 Complexity 的计算方式，有些同学调得十分痛苦，若能知道计算方式，就可以有针对性地修改代码了。

## 初探

同学提到可能与 `for` 和 `if` 的嵌套有关，还可能与 `&&` 和 `||` 的数量有关。

Complexity 没有超过阈值则只显示 `Passed`，不显示具体值，例如以下代码是 `Passed`：

```cpp
bool IsDigit(char c) {
  const char kZero = '0', kNine = '9';
  return c >= kZero && c <= kNine;
}

bool IsWholeNumber(const std::string& text) {
  if (text.empty()) return false;
  if (text == "-" || (text[0] != '-' && !IsDigit(text[0]))) return false;
  for (unsigned i = 1; i < text.size(); ++i) {
    if (!IsDigit(text[i])) return false;
  }
  return true;
}
```

若 Complexity 超过阈值则会显示具体值，例如以下代码中函数 `IsWholeNumber` 的 Complexity 是 $32$（省略 `IsDigit`）：

```cpp {5}
bool IsWholeNumber(const std::string& text) {
  if (text.empty()) return false;
  if (text == "-" || (text[0] != '-' && !IsDigit(text[0]))) return false;
  for (unsigned i = 1; i < text.size(); ++i) {
    if (true) if (true) if (true) if (true) if (true)
    if (!IsDigit(text[i])) return false;
  }
  return true;
}
```

以下代码中函数 `IsWholeNumber` 的 Complexity 是 $19$：

```cpp {5}
bool IsWholeNumber(const std::string& text) {
  if (text.empty()) return false;
  if (text == "-" || (text[0] != '-' && !IsDigit(text[0]))) return false;
  for (unsigned i = 1; i < text.size(); ++i) {
    for (int i = 0; i < 1; ++i) for (int i = 0; i < 1; ++i) for (int i = 0; i < 1; ++i) 
    if (!IsDigit(text[i])) return false;
  }
  return true;
}
```

以下代码中函数 `IsWholeNumber` 的 Complexity 是 $11$：

```cpp {3}
bool IsWholeNumber(const std::string& text) {
  if (text.empty()) return false;
  if (text == "-" || (text[0] != '-' && !IsDigit(text[0])) || ((true || true) && ((true && true) || true))) return false;
  for (unsigned i = 1; i < text.size(); ++i) {
    if (!IsDigit(text[i])) return false;
  }
  return true;
}
```

可以猜想 Complexity 与 `for` 和 `if` 有关，与 `&&` 和 `||` 也有关。

## 逻辑运算

### 实验

保持函数其他部分不变，仅修改某一个 `if` 语句内的表达式，记录 Complexity 的变化量，便可以得到表达式本身贡献的 Complexity，结果如下：

|实验用例|Complexity|
|-|-|
|`A \|\| B`|$1$|
|`A && B`|$1$|
|`A \|\| B \|\| C`|$1$|
|`A \|\| (B \|\| C)`|$1$|
|`A && (B && C)`|$1$|
|`A \|\| (B && C)`|$2$|
|`(A \|\| B) && C`|$2$|
|`(A \|\| B) && (C && D)`|$2$|
|`(A && B) && (C \|\| D)`|$2$|
|`(A && B) \|\| (C && D)`|$3$|
|`(A \|\| B) && (C \|\| D)`|$3$|
|`(A \|\| B) && ((C \|\| D) && E)`|$3$|
|`(A \|\| B) && (C \|\| (D && E))`|$4$|
|`(A \|\| B) && (C \|\| (D && !E))`|$4$|

无论位于第几层的 `if` 语句，相同的表达式贡献均相同。

将表达式移出 `if`，用单独的 `bool` 变量存储，再将该变量用于 `if`，Complexity 不变。

将上述所有 `&&` 和 `||` 全部改为 `&` 和 `|`，均可以在评测系统正常运行，且 Complexity 贡献均变为 $0$。

### 结论

对于一个包含 `&&` 或 `||` 的逻辑运算表达式，按照运算顺序将所有运算符看作一棵树，记父子节点运算符不同的组数为 $m$，则该表达式贡献的 Complexity 为

$$
C = m + 1
$$

- 与表达式所处的位置无关。
- `!` 没有影响。
- 按位与 `&` 和按位或 `|` 没有影响。

如上述最后一例 `(A || B) && (C || (D && !E))`，树形式为

```
   &&
  /  \
||    ||
        \
         &&
```

共有 $3$ 组不同的父子节点，因此贡献的 Complexity 为 $4$，与实际情况吻合。

## 控制流

### 实验

尝试大量 `for`、`while`、`do-while`、`if`、`else-if`、`else`、`?:`（三目运算符）和 `switch` 的组合，并记录 Complexity，由于过于繁琐，不在此列出。

### 结论

- 将函数内所有循环和分支的嵌套结构看作一片森林，每棵树的根节点深度为 $0$
- 将关联的 `if`、`else-if` 和 `else` 看作一个节点，下文提到的 `if` 包括其关联的 `else-if` 和 `else`
- `switch` 及其所有 `case` 看作一个节点
- 计算深度时跳过所有父节点为 `if` 且未被大括号包裹的循环，即这些循环的子节点深度为 `if` 的深度 $+ 1$

$S$ 表示 父节点为 `if` 且未被大括号包裹的循环 之外的节点的集合，$d_s$ 表示节点 $s$ 的深度，$n$ 表示 `else-if` 和 `else` 的数量，则控制流贡献的的 Complexity 为

$$
C = n + \sum_{s \in S} (d_s + 1)
$$

例如以下代码（无 `&&` 或 `||`）：

```cpp
if {} // 深度为 0，贡献 1
if {} // 深度为 0，贡献 1
for { // 深度为 0，贡献 1
    if { // 深度为 1，贡献 2
        ?: // 深度为 2，贡献 3
    }
    else if { // 视作与 if 相同节点，不单独贡献
        if {} // 深度为 2，贡献 3
    }
    else { // 视作与 if 相同节点，不单独贡献
        while { // 紧跟在 if 后但被大括号包裹，不跳过，深度为 2，贡献 3
            if {} // 深度为 3，贡献 4
        }
    }
    switch { // 深度为 1，贡献 2
        case: if {} // 深度为 2，贡献 3
        case: do { // 深度为 2，贡献 3
            if {} // 深度为 3，贡献 4
        } while
    }
}
if while { // if 深度为 0，贡献 1；while 紧跟在 if 后且未被大括号包裹，跳过
    if {} // 深度为 1，贡献 2
}
```

共有一个 `else-if` 和一个 `else`，因此 $n = 2$，总的 Complexity 为

$$
C = 2 + 1 + 1 + 1 + 2 + 3 + 3 + 3 + 4 + 2 + 3 + 3 + 4 + 1 + 2 = 35
$$

与实际情况吻合。

## 总公式

结合逻辑运算与控制流两大部分贡献的 Complexity，可以得出最终的结论：

将函数内每一个包含 `&&` 或 `||` 的逻辑运算表达式按照运算顺序将所有运算符都看作一棵树，将第 $i$ 棵树中父子节点运算符不同的组数记为 $m_i$。

- 与表达式所处的位置无关。
- `!` 没有影响。
- 按位与 `&` 和按位或 `|` 没有影响。

对于控制流

- 将函数内所有循环和分支的嵌套结构看作一片森林，每棵树的根节点深度为 $0$
- 将关联的 `if`、`else-if` 和 `else` 看作一个节点，下文提到的 `if` 包括其关联的 `else-if` 和 `else`
- `switch` 及其所有 `case` 看作一个节点
- 计算深度时跳过所有父节点为 `if` 且未被大括号包裹的循环，即这些循环的子节点深度为 `if` 的深度 $+ 1$

$S$ 表示 父节点为 `if` 且未被大括号包裹的循环 之外的节点的集合，$d_s$ 表示节点 $s$ 的深度，$n$ 表示 `else-if` 和 `else` 的数量。

则 Complexity 为

$$
C = \sum (m_i + 1) + n + \sum_{s \in S} (d_s + 1)
$$

## 如何降低 Complexity

从结论出发，要降低 Complexity，有几个方向
- 正统方法是简化逻辑或优化代码设计，比如函数内抽象层级尽量一致。
- 其次是若某个 `if` 的代码块仅为一个循环，可以将该 `if` 的大括号删去，这可以直接使得该循环内部的所有控制流深度 $- 1$，有时非常有效，且特意设计这样的机制，可以怀疑这是课程推荐的做法。
    - 基于此特性，若有 `if (cond1) { if (cond2) }` 的结构，且满足第二个 `if` 是大括号内仅有的代码，以及第二个 `if` 的代码块执行后一定不再满足第二个 `if` 的条件，则可以直接将其改为 `if (cond1) while (cond2)`，当然，这种方法属于投机取巧的下策，显然不是课程所期望的。
- 最无脑的方法是将逻辑运算改为位运算，或者将逻辑运算转移到单独的函数中，这两种方法各有优劣
    - 前者降低 Complexity 更彻底，因为后者是将 Complexity 转移到其他函数中，不过由于 Complexity 在各个函数单独计算与检查，且题目会根据本身的逻辑复杂度调整阈值，一般在这个方面前者的优势不明显。
    - 前者要求表达式不依赖短路求值；若题目不允许添加类内辅助函数，则后者只要求依赖短路求值的部分不需要访问类的私有成员；若允许，则后者没有限制。
    - 这两种方法都可以在原函数内消除相关部分的 Complexity，当然，两种方法也都属于投机取巧的下策。
- 其他取巧的方法是将几层控制流嵌套机械地封装成函数，这也是下策，说明并没有想到题目期望的解法或设计，且若题目不允许添加类内辅助函数，这种方法有时也无法使用。

## 其他

本文最后一次修改于 2026.10.1。

结论与我在以下课程的题目的测试结果吻合
- Week 4 Thursday: Command-line Arguments
- Week 5 Monday: Input and Output Streams (Additional Practice 1)
- Week 6 Thursday: Operator overloading: member functions

关于 Complexity 恰好为阈值时是否 `Passed`，无从得知，但若本文结论正确，Complexity 恰好为阈值时是 `Passed` 的。

得出结论的过程本质是拟合，因此无法保证结论完全正确，事实上在 2026.9.16 撰写本文之后曾多次出现与实际不吻合的情况，若发现反例，欢迎向我提出。
