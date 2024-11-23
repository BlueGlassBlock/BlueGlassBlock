---
title: GeekGame/THUCTF 2024 IoT Writeup
date: 2024-11-17 23:00:00+8
updated: 2024-11-17 23:00:00+8
categories: 网络安全小记
tags:
  - ctf
  - security
  - hardware
---

没想到我们 GeekGame 还有会员制线下赛。
然而我到最后也没把 Hi3861 SDK 装上。（虽然比赛并不需要）

<!-- more -->

## Hi3861

### Flag 1 - 签到

装完驱动后用 CoolTerm 直接连接即可看到 flag。

![hi-flag1](./$assets/hi-flag1.png)


### Flag 2 - LED 灯与提示

这题其实用逻辑分析仪将一根杜邦线的公头顶着引脚就能捕获 LED 灯的电信号（注意初中物理之二极管单向导电），然后写一段脚本处理就能得到摩斯电码了。

```python
import csv
import math

digital = csv.reader(open("digital.csv", "r"))  # Captured with Logic 2
digital_iter = iter(digital)
next(digital_iter)  # Skip header
data: list[tuple[float, int]] = [(float(row[0]), int(row[1])) for row in digital_iter]
data.insert(0, (0.0, 0))

morse = []

DOT = 1.0
DASH = 3.0
EPS = 0.001

for curr, next in zip(data, data[1:]):
    duration = next[0] - curr[0]
    if curr[1] == 1:
        if math.isclose(duration, DOT, abs_tol=EPS):
            morse.append(".")
        elif math.isclose(duration, DASH, abs_tol=EPS):
            morse.append("-")
morse_code = "".join(morse)
print(morse_code)
```

主要的坑点是有了提示才容易把 flag 中的字符确定下来。

```python
morse_code_dict = {
    "T": "-",
    "H": "....",
    "U": "..-",
    "C": "-.-.",
    "F": "..-.",
    "M": "--",
    "0": "-----",
    "R": ".-.",
    "S": "...",
    "E": ".",
    "_": "..--.-",
    "&": ".-...",
    "L": ".-..",
    "I": "..",
    "G": "--.",
    "N": "-.",
    "1": ".----",
    "{": "-.-..",
    "}": "..-.-",
}
morse_lookup = {v: k for k, v in morse_code_dict.items()}
splitted = """
-
....
..-
-.-.
-
..-.
-.-..
--
-----
.-.
...
.
..--.-
-.-.
-----
.
..--.-
.-...
..--.-
.-..
.
..--.-
.-..
.----
--.
....
-
..-.-
"""

print("".join(morse_lookup.get(c, c) for c in splitted.split()))
# THUCTF{M0RSE_C0E_&_LE_L1GHT}
```

### Flag 4 - 读文档

首先 ADC 引脚不是板子上标了 ADC 的那个针脚（捂脸），参考 `bearpi_hm_nano/doc/figures/B4_basic_adc` 中的图才发现是 GPIO 11 与 12，用杜邦线和 GND 相连就可以把电压清零（虽然似乎这样不好...），值得注意的是要等进入闪灯例程之后再连接，不然进 NFC 例程就坏事了。

![hi-flag4](./$assets/hi-flag4.png)

### Flag 3 - 跳线帽

把板子上的跳线帽换到 GPIO 11 与 GND 的位置再重置板子就可以了。

![hi-flag-3-5](./$assets/hi-flag-3-5.png)

### Flag 5 - Web 题（示）

上面的图中可以看到我们需要使用 NFC 功能，碰触后打开了一个网址 `http://www.charginginquire.online:3000`，同时它提示我们 `flag is not here!`。

这道题说实话做起来体验不是太好，`curl -I` 可以看出后端是简单的 Python `http.server`，再加上有热心观众暴力打服务器于是很容易 502 和 EMPTY_RESPONSE，最后几乎是赛方明示了才成功找到地址 `THUCTF/FLAG5`，大小写敏感。得到 `Flag5: THUCTF{NFC_rans0m_Website}`。

### Flag 6 - 信号与系统先遣服

所以我没做出来（捂脸），明年再战吧（心虚）。

## ESP32

### 串口 Flag 1 - 三点三伏特

其实我是先做蓝牙 Flag 1 的来着，然后看了源码研究了下串口部分的逻辑，发现串口部分需要连续给 GPIO 18 接高电平，于是接 3.3v 等了三秒就过了...好吧是假 flag。接下来需要构造 10000 个上升沿，懒人如我将 CLK 和 GPIO 18 直接短接，就成了。

### 串口 Flag 2 - 另一个串口

从源码里看出 ESP32 的 TX 被设置成了 GPIO 4，但是我用赛方给的 CH340 死活接不到信号，于是放弃了，用逻辑分析器来分析。

![esp32-serial-2](./$assets/esp32-serial-2.png)

### 蓝牙 Flag 1 - Don't u guys have a phone?

Windows 机器要改蓝牙名称属实有点麻烦，用手机代劳后即可看到 flag。

![esp32-bt-1](./$assets/esp32-bt-1.png)

### 蓝牙 Flag 2 - Don't u guys have a phone? v2

在网上搜了一圈后发现了一个叫 `nRF Connect` 的 APP，用它查看 Advertising Data 就能看到 flag 的 Hex 编码，输入 cyberchef 后就能得到 `THUCTF{AdVD47a}`。

### 蓝牙 Flag 3 - 蓝牙笑传之CCB (CharaCteristic with Bleak)

别问我下面的代码为什么要有 try - except。

```python
import asyncio
from bleak import BleakClient, BleakScanner

NAME = "oskmn"
FLAG2 = "THUCTF{AdVD47a}"
async def main():
    devices = await BleakScanner.discover()
    for device in devices:
        if device.name == NAME:
            ADDR = device.address
            break
    async with BleakClient(ADDR) as client:
        for char in client.services.characteristics.values():
            try:
                print(await client.write_gatt_char(char, FLAG2.encode(), response=True))
                print(await client.read_gatt_char(char))
            except Exception as e:
                print(e)
            else:
                print(char.uuid)
asyncio.run(main())
```

![esp32-bt-3](./$assets/esp32-bt-3.png)

### 固件 Flag - 从吹芯片分析固件到 esptool

在源码中可以看到固件中往 `FreeRTOS` 的 `xCreateTask` 中传入了一个 flag，但是在程序层面我们是拿不到这个的，于是需要从固件中提取。
我们用上一点搜索技巧：

![esp32-firmware-search](./$assets/esp32-firmware-search.png)

再学一下怎么让 ESP32 进入下载模式（按住 BOOT 按键再按一下 RST 按键），然后用 `esptool.py` 就可以轻松提取固件了。

```bash
uv run esptool --port COM9 read_flash 0x00000 0x400000 flash_dump.bin
```

等它读完后，直接用 VS Code 里的 Hex Editor 插件打开就能搜索到 flag 了。

![esp32-firmware-dump](./$assets/esp32-firmware-dump.png)

## 完赛的一点感想

作为大一小登拿到校内 #2 也是可喜可贺了，虽然没能 AK 还是留下了一点遗憾，也许研究 https://pysdr.org/content/intro.html 会有所帮助吧。