按照以下内容来实现首页内容

## 布局

页面布局为flex，结构如下(其中 `bg-*` 为了方便区分容器大小)

```html
<div class="flex min-h-screen">
  <aside class="flex min-w-[124px] flex-1 flex-col justify-center bg-[#e3f2fd]">
    <div class="mr-[56px] ml-auto h-[183px] w-[68px] rounded-full bg-indigo-200"></div>
  </aside>

  <div class="flex w-[1200px] flex-none flex-col bg-neutral-50">
    <header class="flex min-h-[80px] flex-1 justify-center bg-[#fff8e1]"></header>

    <main class="flex h-[624px] items-center justify-center bg-[#f3e5f5]"></main>

    <footer class="flex min-h-[80px] flex-1 justify-center bg-[#fff8e1]">
      <div class="mt-[28px] h-[24px] w-[120px] rounded-full bg-rose-300"></div>
    </footer>
  </div>

  <aside class="flex min-w-[124px] flex-1 flex-col justify-center bg-[#e3f2fd]"></aside>
</div>
```

## 蜂巢视图

容器size: 1200 x 624

内部分为三行，内容水平居中(flex)

- size: 960 x 208； 内部4个容器分别为 240x208
- size: 1200 x 208； 内部5个容器分别为 240x208
- size: 960 x 208； 内部4个容器分别为 240x208

上面的容器(固定240x208)，实现为组件。组件结构如下

```html
<div class="flex h-[208px] w-[240px]">
  <div class="h-full w-[20px]"></div>
  <div class="h-full w-full pt-[26px]">
    <div class="flex h-[160px] w-full flex-col items-center justify-center gap-[10px]">
      <div class="h-[128px] w-[128px] rounded-full bg-blue-50">
        <!-- 图标容器 -->
      </div>
      <div class="h-[22px] w-[200px] rounded-md bg-gray-200">
        <!-- 文案容器 -->
      </div>
    </div>
  </div>
  <div class="h-full w-[20px]"></div>
</div>
```

内容三行中的所有容器默认占位，有数据则渲染对应图标和文案。容器渲染从上到下，从左到右直到所有容器铺满。

铺满13个为一页，超过13个后的内容为第二页

## 左侧菜单

size: 68x183， rounded-full，padding-right=124px
