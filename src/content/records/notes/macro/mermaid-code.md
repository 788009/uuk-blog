---
title: Macroeconomics Mermaid Code
published: 2026-05-06
description: ' '
image: ''
tags: []
category: ''
draft: false 
lang: ''
---

```
---
config:
  layout: elk
---
flowchart LR

A(Investment) --> B(Aggregate demand)
C(Consumption) --> B
D(Exports) --> B
E(Imports) -.-> B
F(Real interest rate) -.-> A
G(Government spending) --> B
B --> H(Price level)
B --> I(Real GDP)
H --> J(Inflation rate)
I -.-> K(Unemployment rate)
L(Short-run aggregate supply) -.-> H
L --> I
M(Demand for currency) --> N(Value of currency)
F -.-> O(Supply for currency)
O -.-> N
D --> M
E --> O
N -.-> D
N --> E
H --> P(Nonimal interst rate)
F --> P
I --> C
C --> Q(Money demand)
Q --> P
H -.-> R(Real wealth)
R --> C
H --> Q
P --> F
S(Tax on income) -.-> T(Disposable income)
T --> C
U(Transfer payment) --> T
V(Required reserve ratio) -.-> W(Money supply)
W -.-> P
Q --> X(Quantity of money)
W --> X
G --> AN(Borrowing)
AN --> Y(Demand for loanable funds)
G -.-> AO(Public savings)
AO --> Z(Supply for loanable funds)
S --> AO
S -.-> AN
Y --> F
Z -.-> F
Y --> AA(Quantity of loanable funds)
Z --> AA
H -.-> D
H --> E
F --> AB(Return on domestic asset)
AB --> M
T --> E
AC(Tax on production) --> AD(Production cost)
AD -.-> L
I --> AE(Nonimal GDP)
AE --> I
H --> AE
AF(Nominal wage) --> AD
AG(Raw material price) --> AD
AH(Purchase of government bonds) --> W
AI(Sale of government bonds) -.-> W
AJ(Discount rate) -.-> W
AK(Administered interest rate) --> AL(Demand for reserves)
AL --> AM(Policy rate)
AM --> P
A --> Y
J -.-> D
K -.-> AF
AP(Expected inflation) --> AF
AP --> P
```
