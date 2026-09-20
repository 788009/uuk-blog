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

UIUC CS 128 课程使用 [cs128.org](https://cs128.org/)，其代码题的评测系统有时会计算函数的 Complexity，阈值为 10，若某函数的 Complexity 超过 $10$ 则扣分。

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

以下代码中函数 `IsWholeNumber` 的 Complexity 是 $32$（省略 `IsDigit`）：

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

以下代码是 `Passed`：

```cpp {3}
bool IsWholeNumber(const std::string& text) {
  if (text.empty()) return false;
  if (text == "-" || (text[0] != '-' && !IsDigit(text[0])) || true || true || true || true || true || true || true || true || true || true || true) return false;
  for (unsigned i = 1; i < text.size(); ++i) {
    if (!IsDigit(text[i])) return false;
  }
  return true;
}
```

以下代码中函数 `IsWholeNumber`的 Complexity 是 $19$：

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

可以猜想 Complexity 与 `for` 和 `if` 有关，与 `&&` 和 `||` 无关。

## 实验

基于此猜想，我尝试了大量 `for`、`while`、`do-while`、`if`、`else-if`、`else`、`?:`（三目运算符）和 `switch` 的组合，并记录 Complexity，结果如下：

|实验用例|Complexity|
|-|-|
|`if; if; for if*6`|$32$|
|`if; if; for if*5`|$25$|
|`if; if; for if*4`|$19$|
|`if; if; for if*3`|$14$|
|`if; if; for if*2`|`Passed`|
|`if; if; for if for if`|`Passed`|
|`if; if; for if for*4 if`|$25$|
|`​if; if; for if for*3 if`|$19$|
|`​if; if; for*4 if`|$19$|
|​`if; if; for if*2 for*3 if`|$25$|
|`if; if; if for if for`|`Passed`|
|`if; if; for*3`|`Passed`|
|`if; if; for*3 if`|$14$|
|`if; if; for*2 if*2`|$14$|
|`if; if; for if for if for`|`Passed`|
|`if; if; for*3 if for`|$14$|
|`if; if; for if*3 for if`|$19$|
|`if; if; if; for if*3 for if`|$20$|
|`if for; if; if; for if*3 for if`|$20$|
|`if*2; if; if; for if*3 for if`|$22$|
|`for if*2; if; if; for if*3 for if`|$25$|
|`for if*2; if*2; if; for if*3 for if`|$27$|
|`for if*2; if*2; if; for {if*2; if*3 for if}`|$32$|
|`for if*2; if*2; if; if for {if*2; if*3 for if}`|$32$|
|`if; if; for {while*2 if while; if}`|$16$|
|`if; if; for {while*2 if while; do-while if do-while}`|$19$|
|`if; if; for {while*2 if while; do-while if do-while switch {if} {do-while if}}`|$39$|
|`if; if; for {if*5; if}`|$27$|
|`if; if; for {if*5; if else}`|$28$|
|`if; if; for {if*5; if else-if else}`|$29$|
|`if; if; for {if*5; if else-if {if} else}`|$32$|
|`if; if; for {if*5; if else-if {if} else while}`|$32$|
|`if; if; for {if*5 else-if; if else-if {if} else while}`|$33$|
|`if; if; for {if else-if {if} else while if; switch {if} {do-while if}}}`|$27$|
|`if; if; for {if {?:} else-if {if} else while if; switch {if} {do-while if}}}`|$29$|

格式说明：以最后一条为例，相当于

```cpp
if {}
if {}
for {
    if {
        ?:
    }
    else if {
        if {}
    }
    else {
        while {
            if {}
        }
    }
    switch {
        case: if {}
        case: do {
            if {}
        } while
    }
}
```

## 结论

直接把数据给多个 AI 尝试，经过我的整合与修正，得出以下结论：

- 将函数内所有循环和分支的嵌套结构看作一片森林，每棵树的根节点深度为 $0$
- 将关联的 `if`、`else-if` 和 `else` 看作一个节点，下文提到的 `if` 包括其关联的 `else-if` 和 `else`
- `switch` 及其所有 `case` 看作一个节点
- 计算深度时跳过所有父节点为 `if` 的循环，即这些循环的子节点深度为 `if` 的深度 $+ 1$

$S$ 表示 父节点为 `if` 的循环 之外的节点的集合，$d_s$ 表示节点 $s$ 的深度，$n$ 表示 `else-if` 和 `else` 的数量，则该函数的 Complexity 为

$$
C = 2 +  n + \sum_{s \in S} (1 + d_s)
$$

例如 `if; if; for {if else-if {if} else while; switch {if} {do-while if}}}`：

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
        while { // 紧跟在 if 后，跳过
            if {} // 深度为 2，贡献 3
        }
    }
    switch { // 深度为 1，贡献 2
        case: if {} // 深度为 2，贡献 3
        case: do { // 深度为 2，贡献 3
            if {} // 深度为 3，贡献 4
        } while
    }
}
```

共有一个 `else-if` 和一个 `else`，因此 $n = 2$，再加上常数 $2$，总的 Complexity 为

$$
C = 2 + 2 + 1 + 1 + 1 + 2 + 3 + 3 + 3 + 2 + 3 + 3 + 4 = 29
$$

与实际情况吻合。

实际上，该结论与上述所有测试用例均吻合。

因此，要减少 Complexity，最有效的方法就是减少嵌套层数，首先应当尝试简化逻辑，逻辑实在想不到如何简化的话，可以将几层嵌套封装成函数，这样单个函数内的嵌套就变少了，Complexity 自然也减少，当然，此为下策，这说明并没有想到题目期望的解法，但确实可以通过 Complexity 检查。

另外，关于 Complexity 恰好为 $10$ 时是否 `Passed`，无从得知，但若本文结论正确，Complexity 恰好为 $10$ 时是 `Passed` 的，例如 `if; if; for*3` 的 Complexity 用本文结论计算为 $10$，实际 `Passed`。
