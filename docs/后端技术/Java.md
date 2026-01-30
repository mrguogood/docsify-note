# JVM

## 简介

JVM 是 Java Virtual Machine 的缩写，它是一个虚构出来的计算机，一种规范。通过在实际的计算机上仿真模拟各类计算机功能实现···

其实就类似于一台小电脑运行在 windows 或者 linux 这些操作系统环境下即可。它直接和操作系统进行交互，与硬件不直接交互，而操作系统可以帮我们完成和硬件进行交互的工作。

![img](../images/image-20240321160520663.png)

## Java 文件是如何被运行的

比如我们现在写了一个 HelloWorld.java 好了，那这个 HelloWorld.java 抛开所有东西不谈，那是不是就类似于一个文本文件，只是这个文本文件它写的都是英文，而且有一定的缩进而已。

那我们的 **JVM** 是不认识文本文件的，所以它需要一个 **编译** ，让其成为一个它会读二进制文件的 **HelloWorld.class**

### 类加载器

 如果 **JVM** 想要执行这个 **.class** 文件，我们需要将其装进一个 **类加载器** 中，它就像一个搬运工一样，会把所有的 **.class** 文件全部搬进 JVM 里面来。

![img](../images/image-20240321160922798.png)

### 方法区

**方法区** 是用于存放类似于元数据信息方面的数据的，比如类信息，常量，静态变量，编译后代码···等

类加载器将 .class 文件搬过来就是先丢到这一块上



### 堆

**堆** 主要放了一些存储的数据，比如对象实例，数组···等，它和方法区都同属于 **线程共享区域** 。也就是说它们都是 **线程不安全** 的



### 栈

**栈** 这是我们的代码运行空间。我们编写的每一个方法都会放到 **栈** 里面运行。

我们会听说过 本地方法栈 或者 本地方法接口 这两个名词，不过我们基本不会涉及这两块的内容，它俩底层是使用 C 来进行工作的，和 Java 没有太大的关系。



### 程序计数器

主要就是完成一个加载工作，类似于一个指针一样的，指向下一行我们需要执行的代码。和栈一样，都是 **线程独享** 的，就是说每一个线程都会有自己对应的一块区域而不会存在并发和多线程的问题。
![img](../images/image-20240321161358665.png)

### 总结

1. Java 文件经过编译后变成 .class 字节码文件
2. 字节码文件通过类加载器被搬运到 JVM 虚拟机中
3. 虚拟机主要的 5 大块：方法区，堆都为线程共享区域，有线程安全问题，栈和本地方法栈和计数器都是独享区域，不存在线程安全问题，而 JVM 的调优主要就是围绕堆，栈两大块进行

### 举例

一个学生类：

![img](../images/12f0b239db65b8a95f0ce90e9a580e4d.png)

一个 main 方法：

![img](../images/0c6d94ab88a9f2b923f5fea3f95bc2eb.png)

执行 main 方法的步骤如下:

1. 编译好 App.java 后得到 App.class 后，执行 App.class，系统会启动一个 JVM 进程，从 classpath 路径中找到一个名为 App.class 的二进制文件，将 App 的类信息加载到运行时数据区的方法区内，这个过程叫做 App 类的加载
2. JVM 找到 App 的主程序入口，执行 main 方法
3. 这个 main 中的第一条语句为 Student student = new Student("tellUrDream") ，就是让 JVM 创建一个 Student 对象，但是这个时候方法区中是没有 Student 类的信息的，所以 JVM 马上加载 Student 类，把 Student 类的信息放到方法区中
4. 加载完 Student 类后，JVM 在堆中为一个新的 Student 实例分配内存，然后调用构造函数初始化 Student 实例，这个 Student 实例持有 **指向方法区中的 Student 类的类型信息** 的引用
5. 执行 student.sayName();时，JVM 根据 student 的引用找到 student 对象，然后根据 student 对象持有的引用定位到方法区中 student 类的类型信息的方法表，获得 sayName() 的字节码地址。
6. 执行 sayName()

其实也不用管太多，只需要知道对象实例初始化时会去方法区中找类信息，完成后再到栈那里去运行方法。找方法就在方法表中找。



## 类加载器的介绍

*负责加载.class 文件的，它们在文件开头会有特定的文件标示，将 class 文件字节码内容加载到内存中，并将这些内容转换成方法区中的运行时数据结构，并且 ClassLoader 只负责 class 文件的加载，而是否能够运行则由 Execution Engine 来决定*

### 类加载器的流程

从类被加载到虚拟机内存中开始，到释放内存总共有 7 个步骤：加载，验证，准备，解析，初始化，使用，卸载。其中**验证，准备，解析三个部分统称为连接**



#### 加载

1. 将 class 文件加载到内存
2. 将静态数据结构转化成方法区中运行时的数据结构
3. 在堆中生成一个代表这个类的 java.lang.Class 对象作为数据访问的入口



#### 链接

验证：确保加载的类符合 JVM 规范和安全，保证被校验类的方法在运行时不会做出危害虚拟机的事件，其实就是一个安全检查

准备：为 static 变量在方法区中分配内存空间，设置变量的初始值，例如 static int a = 3 （注意：准备阶段只设置类中的静态变量（方法区中），不包括实例变量（堆内存中），实例变量是对象初始化时赋值的）

解析：虚拟机将常量池内的符号引用替换为直接引用的过程（符号引用比如我现在 import java.util.ArrayList 这就算符号引用，直接引用就是指针或者对象地址，注意引用对象一定是在内存进行）



#### 初始化

初始化其实就是执行类构造器方法的`<clinit>()`的过程，而且要保证执行前父类的`<clinit>()`方法执行完毕。这个方法由编译器收集，顺序执行所有类变量（static 修饰的成员变量）显式初始化和静态代码块中语句。此时准备阶段时的那个 `static int a` 由默认初始化的 0 变成了显式初始化的 3。 由于执行顺序缘故，初始化阶段类变量如果在静态代码块中又进行了更改，会覆盖类变量的显式初始化，最终值会为静态代码块中的赋值。

> 注意：字节码文件中初始化方法有两种，非静态资源初始化的`<init>`和静态资源初始化的`<clinit>`，类构造器方法`<clinit>()`不同于类的构造器，这些方法都是字节码文件中只能给 JVM 识别的特殊方法。



#### 卸载

GC 将无用对象从内存中卸载



### 类加载器的加载顺序

加载一个 Class 类的顺序也是有优先级的，类加载器从最底层开始往上的顺序是这样的

1. BootStrap ClassLoader：rt.jar
2. Extension ClassLoader: 加载扩展的 jar 包
3. App ClassLoader：指定的 classpath 下面的 jar 包
4. Custom ClassLoader：自定义的类加载器



### 双亲委派机制

当一个类收到了加载请求时，它是不会先自己去尝试加载的，而是委派给父类去完成，比如我现在要 new 一个 Person，这个 Person 是我们自定义的类，如果我们要加载它，就会先委派 App ClassLoader ，只有当父类加载器都反馈自己无法完成这个请求（也就是父类加载器都没有找到加载所需的 Class）时，子类加载器才会自行尝试加载。

这样做的好处是，加载位于 rt.jar 包中的类时不管是哪个加载器加载，最终都会委托到 BootStrap ClassLoader 进行加载，这样保证了使用不同的类加载器得到的都是同一个结果。

其实这个也是一个隔离的作用，避免了我们的代码影响了 JDK 的代码，比如我现在自己定义一个 `java.lang.String`：

```
package java.lang;
public class String {
    public static void main(String[] args) {
        System.out.println();
    }
}
```

尝试运行当前类的 `main` 函数的时候，我们的代码肯定会报错。这是因为在加载的时候其实是找到了 rt.jar 中的`java.lang.String`，然而发现这个里面并没有 `main` 方法。



## 运行时数据区



### 本地方法栈和程序计数器

比如说我们现在点开 Thread 类的源码，会看到它的 start0 方法带有一个 native 关键字修饰，而且不存在方法体，这种用 native 修饰的方法就是本地方法，这是使用 C 来实现的，然后一般这些方法都会放到一个叫做本地方法栈的区域。

程序计数器其实就是一个指针，它指向了我们程序中下一句需要执行的指令，它也是内存区域中唯一一个不会出现 OutOfMemoryError 的区域，而且占用内存空间小到基本可以忽略不计。这个内存仅代表当前线程所执行的字节码的行号指示器，字节码解析器通过改变这个计数器的值选取下一条需要执行的字节码指令。

如果执行的是 native 方法，那这个指针就不工作了。



### 方法区

方法区主要的作用是存放类的元数据信息，常量和静态变量···等。当它存储的信息过大时，会在无法满足内存分配时报错。



###  虚拟机栈和虚拟机堆

一句话便是：栈管运行，堆管存储。则虚拟机栈负责运行代码，而虚拟机堆负责存储数据。



#### 虚拟机栈的概念

它是 Java 方法执行的内存模型。里面会对局部变量，动态链表，方法出口，栈的操作（入栈和出栈）进行存储，且线程独享。同时如果我们听到局部变量表，那也是在说虚拟机栈

```java
public class Person{
    int a = 1;

    public void doSomething(){
        int b = 2;
    }
}

```

#### 虚拟机栈存在的异常

如果线程请求的栈的深度大于虚拟机栈的最大深度，就会报 **StackOverflowError** （这种错误经常出现在递归中）。Java 虚拟机也可以动态扩展，但随着扩展会不断地申请内存，当无法申请足够内存时就会报错 **OutOfMemoryError**。



####  虚拟机栈的生命周期

对于栈来说，不存在垃圾回收。只要程序运行结束，栈的空间自然就会释放了。栈的生命周期和所处的线程是一致的。

这里补充一句：8 种基本类型的变量+对象的引用变量+实例方法都是在栈里面分配内存。



####  虚拟机栈的执行

我们经常说的栈帧数据，说白了在 JVM 中叫栈帧，放到 Java 中其实就是方法，它也是存放在栈中的。

栈中的数据都是以栈帧的格式存在，它是一个关于方法和运行期数据的数据集。比如我们执行一个方法 a，就会对应产生一个栈帧 A1，然后 A1 会被压入栈中。同理方法 b 会有一个 B1，方法 c 会有一个 C1，等到这个线程执行完毕后，栈会先弹出 C1，后 B1,A1。它是一个先进后出，后进先出原则。



局部变量的复用

局部变量表用于存放方法参数和方法内部所定义的局部变量。它的容量是以 Slot 为最小单位，一个 slot 可以存放 32 位以内的数据类型。

虚拟机通过索引定位的方式使用局部变量表，范围为 `[0,局部变量表的 slot 的数量]`。方法中的参数就会按一定顺序排列在这个局部变量表中，至于怎么排的我们可以先不关心。而为了节省栈帧空间，这些 slot 是可以复用的，当方法执行位置超过了某个变量，那么这个变量的 slot 可以被其它变量复用。当然如果需要复用，那我们的垃圾回收自然就不会去动这些内存。



#### 虚拟机堆的概念

VM 内存会划分为堆内存和非堆内存，堆内存中也会划分为**年轻代**和**老年代**，而非堆内存则为**永久代**。年轻代又会分为**Eden**和**Survivor**区。Survivor 也会分为**FromPlace**和**ToPlace**，toPlace 的 survivor 区域是空的。Eden，FromPlace 和 ToPlace 的默认占比为 **8:1:1**。当然这个东西其实也可以通过一个 -XX:+UsePSAdaptiveSurvivorSizePolicy 参数来根据生成对象的速率动态调整

堆内存中存放的是对象，垃圾收集就是收集这些对象然后交给 GC 算法进行回收。非堆内存其实我们已经说过了，就是方法区。在 1.8 中已经移除永久代，替代品是一个元空间(MetaSpace)，最大区别是 metaSpace 是不存在于 JVM 中的，它使用的是本地内存。并有两个参数

```plain
MetaspaceSize：初始化元空间大小，控制发生GC
MaxMetaspaceSize：限制元空间大小上限，防止占用过多物理内存。
```

移除的原因可以大致了解一下：融合 HotSpot JVM 和 JRockit VM 而做出的改变，因为 JRockit 是没有永久代的，不过这也间接性地解决了永久代的 OOM 问题。



#### Eden 年轻代的介绍

当我们 new 一个对象后，会先放到 Eden 划分出来的一块作为存储空间的内存，但是我们知道对堆内存是线程共享的，所以有可能会出现两个对象共用一个内存的情况。这里 JVM 的处理是为每个线程都预先申请好一块连续的内存空间并规定了对象存放的位置，而如果空间不足会再申请多块内存空间。这个操作我们会称作 TLAB，有兴趣可以了解一下。

当 Eden 空间满了之后，会触发一个叫做 Minor GC（就是一个发生在年轻代的 GC）的操作，存活下来的对象移动到 Survivor0 区。此时还会把 from 和 to 两个指针交换，这样保证了一段时间内总有一个 survivor 区为空且 to 所指向的 survivor 区为空。经过多次的 Minor GC 后仍然存活的对象（**这里的存活判断是 15 次，对应到虚拟机参数为 -XX:MaxTenuringThreshold 。为什么是 15，因为 HotSpot 会在对象头中的标记字段里记录年龄，分配到的空间仅有 4 位，所以最多只能记录到 15**）会移动到老年代。

``tex
Eden 区内存空间满了的时候，就会触发 Minor GC，Survivor0 区满不会触发 Minor GC 。
那 Survivor0 区 的对象什么时候垃圾回收呢？
假设 Survivor0 区现在是满的，此时又触发了 Minor GC ，发现 Survivor0 区依旧是满的，存不下，此时会将 S0 区与 Eden 区的对象一起进行可达性分析，找出活跃的对象，将它复制到 S1 区并且将 S0 区域和 Eden 区的对象给清空，这样那些不可达的对象进行清除，并且将 S0 区 和 S1 区交换。
```



老年代是存储长期存活的对象的，占满时就会触发我们最常听说的 Full GC，期间会停止所有线程等待 GC 的完成。所以对于响应要求高的应用应该尽量去减少发生 Full GC 从而避免响应超时的问题。

而且当老年区执行了 full gc 之后仍然无法进行对象保存的操作，就会产生 OOM，这时候就是虚拟机中的堆内存不足，原因可能会是堆内存设置的大小过小，这个可以通过参数-Xms、-Xmx 来调整。也可能是代码中创建的对象大且多，而且它们一直在被引用从而长时间垃圾收集无法收集它们。

![image-398255141fde8ba208f6c99f4edaa9fe](../images/398255141fde8ba208f6c99f4edaa9fe.png)

补充说明：关于-XX:TargetSurvivorRatio 参数的问题。其实也不一定是要满足-XX:MaxTenuringThreshold 才移动到老年代。可以举个例子：如对象年龄 5 的占 30%，年龄 6 的占 36%，年龄 7 的占 34%，加入某个年龄段（如例子中的年龄 6）后，总占用超过 Survivor 空间*TargetSurvivorRatio 的时候，从该年龄段开始及大于的年龄对象就要进入老年代（即例子中的年龄 6 对象，就是年龄 6 和年龄 7 晋升到老年代），这时候无需等到 MaxTenuringThreshold 中要求的 15



#### 如何判断一个对象需要被干掉

![image-1ba7f3cff6e07c6e9c6765cc4ef74997](../images/1ba7f3cff6e07c6e9c6765cc4ef74997.png)

图中程序计数器、虚拟机栈、本地方法栈，3 个区域随着线程的生存而生存的。内存分配和回收都是确定的。随着线程的结束内存自然就被回收了，因此不需要考虑垃圾回收的问题。而 Java 堆和方法区则不一样，各线程共享，内存的分配和回收都是动态的。因此垃圾收集器所关注的都是堆和方法这部分内存。

在进行回收前就要判断哪些对象还存活，哪些已经死去。下面介绍两个基础的计算方法

1.**引用计数器计算**：给对象添加一个引用计数器，每次引用这个对象时计数器加一，引用失效时减一，计数器等于 0 时就是不会再次使用的。不过这个方法有一种情况就是出现对象的循环引用时 GC 没法回收。

2.**可达性分析计算**：这是一种类似于二叉树的实现，将一系列的 GC ROOTS 作为起始的存活对象集，从这个节点往下搜索，搜索所走过的路径成为引用链，把能被该集合引用到的对象加入到集合中。搜索当一个对象到 GC Roots 没有使用任何引用链时，则说明该对象是不可用的。主流的商用程序语言，例如 Java，C#等都是靠这招去判定对象是否存活的。



了解一下即可）在 Java 语言汇总能作为 GC Roots 的对象分为以下几种：

1. 虚拟机栈（栈帧中的本地方法表）中引用的对象（局部变量）
2. 方法区中静态变量所引用的对象（静态变量）
3. 方法区中常量引用的对象
4. 本地方法栈（即 native 修饰的方法）中 JNI 引用的对象（JNI 是 Java 虚拟机调用对应的 C 函数的方式，通过 JNI 函数也可以创建新的 Java 对象。且 JNI 对于对象的局部引用或者全局引用都会把它们指向的对象都标记为不可回收）
5. 已启动的且未终止的 Java 线程

这种方法的优点是能够解决循环引用的问题，可它的实现需要耗费大量资源和时间，也需要 GC（它的分析过程引用关系不能发生变化，所以需要停止所有进程）



#### 如何宣告一个对象的真正死亡

首先必须要提到的是一个名叫 **finalize()** 的方法

finalize()是 Object 类的一个方法、一个对象的 finalize()方法只会被系统自动调用一次，经过 finalize()方法逃脱死亡的对象，第二次不会再调用。

补充一句：并不提倡在程序中调用 finalize()来进行自救。建议忘掉 Java 程序中该方法的存在。因为它执行的时间不确定，甚至是否被执行也不确定（Java 程序的不正常退出），而且运行代价高昂，无法保证各个对象的调用顺序（甚至有不同线程中调用）。在 Java9 中已经被标记为 **deprecated** ，且 `java.lang.ref.Cleaner`（也就是强、软、弱、幻象引用的那一套）中已经逐步替换掉它，会比 `finalize` 来的更加的轻量及可靠。

判断一个对象的死亡至少需要两次标记

1. 如果对象进行可达性分析之后没发现与 GC Roots 相连的引用链，那它将会第一次标记并且进行一次筛选。判断的条件是决定这个对象是否有必要执行 finalize()方法。如果对象有必要执行 finalize()方法，则被放入 F-Queue 队列中。
2. GC 对 F-Queue 队列中的对象进行二次标记。如果对象在 finalize()方法中重新与引用链上的任何一个对象建立了关联，那么二次标记时则会将它移出“即将回收”集合。如果此时对象还没成功逃脱，那么只能被回收了。

如果确定对象已经死亡，我们又该如何回收这些垃圾呢



#### 垃圾回收算法

![image-9ff72176ab0bf58bc43e142f69427379](../images/9ff72176ab0bf58bc43e142f69427379.png)

到 jdk8 为止，默认的垃圾收集器是 Parallel Scavenge 和 Parallel Old

从 jdk9 开始，G1 收集器成为默认的垃圾收集器
 目前来看，G1 回收器停顿时间最短而且没有明显缺点，非常适合 Web 应用。在 jdk8 中测试 Web 应用，堆内存 6G，新生代 4.5G 的情况下，Parallel Scavenge 回收新生代停顿长达 1.5 秒。G1 回收器回收同样大小的新生代只停顿 0.2 秒。



#### JVM 的常用参数

[JVM 的常用参数](https://javaguide.cn/java/jvm/jvm-intro.html#_3-6-了解-jvm-的常用参数)



###  JVM 调优的一些方面

[ JVM 调优的一些方面](https://javaguide.cn/java/jvm/jvm-intro.html#四、关于-jvm-调优的一些方面)

# 线程与进程

- **进程**：是指⼀个内存中运⾏的应⽤程序，每个进程都有⼀个独⽴的内存空间，⼀个应⽤程序可以同时运⾏多个进程；进程也是程序的⼀次执⾏过程，是系统运⾏程序的基本单位；系统运⾏⼀个程序即是 ⼀个进程从创建、运⾏到消亡的过程。
- **线程**：线程是进程中的⼀个执⾏单元，负责当前进程中程序的执⾏，⼀个进程中⾄少有⼀个线程。⼀个进程中是可以有多个线程的，这个应⽤程序也可以称之为多线程程序。



## 线程创建

- 方式一：继承于Thread类
- 方式二：实现Runnable接口
- 方式三：实现Callable接口
- 方式四：使用线程池
- 方式五：使用匿名类

### 继承于Thread类

*步骤：
1.创建一个继承于Thread类的子类
2.重写Thread类的run() --> 将此线程执行的操作声明在run()中
3.创建Thread类的子类的对象
4.通过此对象调用start()执行线程*



```java
package atguigu.java;

//1.创建一个继承于Thread类的子类
class MyThread extends Thread {
    //2.重写Thread类的run()
    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            if (i % 2 == 0) {
                System.out.println(Thread.currentThread().getName() + ":" + i);
            }
        }
    }
}


public class ThreadTest {
    public static void main(String[] args) {
        //3.创建Thread类的子类的对象
        MyThread t1 = new MyThread();

        //4.通过此对象调用start():①启动当前线程 ② 调用当前线程的run()
        t1.start();

        /*问题一：我们不能通过直接调用run()的方式启动线程，
        这种方式只是简单调用方法，并未新开线程*/
        //t1.run();

        /*问题二：再启动一个线程，遍历100以内的偶数。
        不可以还让已经start()的线程去执行。会报IllegalThreadStateException*/
        //t1.start();

        //重新创建一个线程的对象
        MyThread t2 = new MyThread();
        t2.start();

        //如下操作仍然是在main线程中执行的。
        for (int i = 0; i < 100; i++) {
            if (i % 2 == 0) {
                System.out.println(Thread.currentThread().getName() + ":" + i + "***********main()************");
            }
        }
    }
}
```



### 实现Runnable接口

*步骤：
1.创建一个实现了Runnable接口的类
2.实现类去实现Runnable中的抽象方法：run()
3.创建实现类的对象
4.将此对象作为参数传递到Thread类的构造器中，创建Thread类的对象
5.通过Thread类的对象调用start()
① 启动线程
②调用当前线程的run()–>调用了Runnable类型的target的run()*



```java
package atguigu.java;

//1.创建一个实现了Runnable接口的类
class MThread implements Runnable {

    //2.实现类去实现Runnable中的抽象方法：run()
    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            if (i % 2 == 0) {
                System.out.println(Thread.currentThread().getName() + ":" + i);
            }
        }
    }
}

public class ThreadTest1 {

    public static void main(String[] args) {
        //3.创建实现类的对象
        MThread mThread = new MThread();

        //4.将此对象作为参数传递到Thread类的构造器中，创建Thread类的对象
        Thread t1 = new Thread(mThread);
        t1.setName("线程1");

        //5.通过Thread类的对象调用start():① 启动线程 ②调用当前线程的run()-->调用了Runnable类型的target的run()
        t1.start();

        //再启动一个线程，遍历100以内的偶数
        Thread t2 = new Thread(mThread);
        t2.setName("线程2");
        t2.start();
    }

}
```

### 实现Callable接口

*步骤：
1.创建一个实现Callable的实现类
2.实现call方法，将此线程需要执行的操作声明在call()中
3.创建Callable接口实现类的对象
4.将此Callable接口实现类的对象作为传递到FutureTask构造器中，创建FutureTask的对象
5.将FutureTask的对象作为参数传递到Thread类的构造器中，创建Thread对象，并调用start()
6.获取Callable中call方法的返回值*



实现Callable接口的方式创建线程的强大之处

- call()可以有返回值的
- call()可以抛出异常，被外面的操作捕获，获取异常的信息
- Callable是支持泛型的



```java
package com.atguigu.java2;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

//1.创建一个实现Callable的实现类
class NumThread implements Callable {
    //2.实现call方法，将此线程需要执行的操作声明在call()中
    @Override
    public Object call() throws Exception {
        int sum = 0;
        //把100以内的偶数相加
        for (int i = 1; i <= 100; i++) {
            if (i % 2 == 0) {
                System.out.println(i);
                sum += i;
            }
        }
        return sum;
    }
}

public class ThreadNew {
    public static void main(String[] args) {    
        //3.创建Callable接口实现类的对象
        NumThread numThread = new NumThread();

        //4.将此Callable接口实现类的对象作为传递到FutureTask构造器中，创建FutureTask的对象
        FutureTask futureTask = new FutureTask(numThread);

        //5.将FutureTask的对象作为参数传递到Thread类的构造器中，创建Thread对象，并调用start()
        new Thread(futureTask).start();

        try {
            //6.获取Callable中call方法的返回值
            //get()返回值即为FutureTask构造器参数Callable实现类重写的call()的返回值。
            Object sum = futureTask.get();
            System.out.println("总和为：" + sum);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    }

}
```



### 使用线程池

*步骤：
1.以方式二或方式三创建好实现了Runnable接口的类或实现Callable的实现类
2.实现run或call方法
3.创建线程池
4.调用线程池的execute方法执行某个线程，参数是之前实现Runnable或Callable接口的对象*



*线程池好处：
1.提高响应速度（减少了创建新线程的时间）
2.降低资源消耗（重复利用线程池中线程，不需要每次都创建）
3.便于线程管理*



核心参数：

- corePoolSize：核心池的大小
- maximumPoolSize：最大线程数
- keepAliveTime：线程没有任务时最多保持多长时间后会终止



```java
package com.atguigu.java2;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

class NumberThread implements Runnable {
    @Override
    public void run() {
        //遍历100以内的偶数
        for (int i = 0; i <= 100; i++) {
            if (i % 2 == 0) {
                System.out.println(Thread.currentThread().getName() + ": " + i);
            }
        }
    }
}

class NumberThread1 implements Runnable {
    @Override
    public void run() {
        //遍历100以内的奇数
        for (int i = 0; i <= 100; i++) {
            if (i % 2 != 0) {
                System.out.println(Thread.currentThread().getName() + ": " + i);
            }
        }
    }
}


public class ThreadPool {

    public static void main(String[] args) {
        //1. 提供指定线程数量的线程池
        ExecutorService service = Executors.newFixedThreadPool(10);

        //输出class java.util.concurrent.ThreadPoolExecutor
        System.out.println(service.getClass());

        ThreadPoolExecutor service1 = (ThreadPoolExecutor) service;
        //自定义线程池的属性
//        service1.setCorePoolSize(15);
//        service1.setKeepAliveTime();

        //2. 执行指定的线程的操作。需要提供实现Runnable接口或Callable接口实现类的对象
        service.execute(new NumberThread());//适用于Runnable
        service.execute(new NumberThread1());//适用于Runnable
//        service.submit(Callable callable);//适合使用于Callable

        //3. 关闭连接池
        service.shutdown();
    }

}
```

### 使用匿名类

```
Thread thread = new Thread(new Runnable() {
	@Override
	public void run() {
		// 线程需要执行的任务代码
		System.out.println("子线程开始启动....");
		for (int i = 0; i < 30; i++) {
			System.out.println("run i:" + i);
		}
	}
});
thread.start();
```

或者

``java
new Thread(() -> {
	System.out.println(Thread.currentThread().getName() + "\t上完自习，离开教室");
}, "MyThread").start();
```

### 注意

**Thread 和 Runnable 的区别：**

*如果⼀个类继承 Thread ，则不适合资源共享。但是如果实现了 Runable 接⼝的话，则很容易的实现资源共享*

**总结：**

**实现** Runnable **接⼝⽐继承** Thread **类所具有的优势：**

1. 适合多个相同的程序代码的线程去共享同⼀个资源。
2. 可以避免 java 中的单继承的局限性。
3. 增加程序的健壮性，实现解耦操作，代码可以被多个线程共享，代码和线独⽴。
4. 线程池只能放⼊实现 Runable 或 Callable 类线程，不能直接放⼊继承 Thread 的类。



*扩充：在 java 中，每次程序运⾏⾄少启动 2 个线程。⼀个是 main 线程，⼀个是垃圾收集（GC）线程。因为 每当使⽤ java 命令执⾏⼀个类的时候，实际上都会启动⼀个 JVM ，每⼀个 JVM 其实在就是在操作系 统中启动了⼀个进程。*



## 线程的生命周期

*当线程启动后（线程对象调用start方法），它不能一直"独占"着CPU独自运行，所以CPU需要在多条线程之间切换，于是线程状态也会多次在运行、阻塞之间切换*



*在线程的生命周期中：
它要经过新建（**New**）、就绪（**Runnable**）、运行（**Running**）、阻塞（**Blocked**）和死亡（**Dead**）五种状态。*

![image-20240320210733011](../images/image-20240320210733011.png)

### 创建

```java
public class XThread extends Thread{
    @Override
        public void run() {
            
        }
}
//新建就是new出对象
XThread thread = new XThread();  //这就是新建
```

当程序使用new关键字创建了一个线程之后，该线程就处于一个新建状态（初始状态），此时它和其他Java对象一样，仅仅由Java虚拟机为其分配了内存，并初始化了其成员变量值。此时的线程对象没有表现出任何线程的动态特征，程序也不会执行线程的线程执行体



### 就绪

**当线程对象调用了Thread.start()方法之后，该线程处于就绪状态。**

Java虚拟机会为其创建方法调用栈和程序计数器，处于这个状态的线程并没有开始运行，它只是表示该线程可以运行了。从start()源码中看出，start后添加到了线程列表中，接着在native层添加到VM中，至于该线程何时开始运行，取决于JVM里线程调度器的调度(如果OS调度选中了，就会进入到运行状态)。



### 运行

**当线程对象调用了Thread.start()方法之后，该线程处于就绪状态。**

添加到了线程列表中，如果OS调度选中了，就会进入到运行状态



### 阻塞

阻塞状态是线程因为某种原因放弃CPU使用权，暂时停止运行。直到线程进入就绪状态，才有机会转到运行状态。阻塞的情况大概三种：

- 1、**等待阻塞**：运行的线程执行wait()方法，JVM会把该线程放入等待池中。(wait会释放持有的锁)
- 2、**同步阻塞**：运行的线程在获取对象的同步锁时，若该同步锁被别的线程占用，则JVM会把该线程放入锁池中。
- 3、**其他阻塞**：运行的线程执行sleep()或join()方法，或者发出了I/O请求时，JVM会把该线程置为阻塞状态。当sleep()状态超时、join()等待线程终止或者超时、或者I/O处理完毕时，线程重新转入就绪状态。（注意,sleep是不会释放持有的锁）。
- 线程睡眠：Thread.sleep(long millis)方法，使线程转到阻塞状态。millis参数设定睡眠的时间，以毫秒为单位。当睡眠结束后，就转为就绪（Runnable）状态。sleep()平台移植性好。
- 线程等待：Object类中的wait()方法，导致当前的线程等待，直到其他线程调用此对象的 notify() 方法或 notifyAll() 唤醒方法。这个两个唤醒方法也是Object类中的方法，行为等价于调用 wait(0) 一样。唤醒线程后，就转为就绪（Runnable）状态。
- 线程让步：Thread.yield() 方法，暂停当前正在执行的线程对象，把执行机会让给相同或者更高优先级的线程。
- 线程加入：join()方法，等待其他线程终止。在当前线程中调用另一个线程的join()方法，则当前线程转入阻塞状态，直到另一个进程运行结束，当前线程再由阻塞转为就绪状态。
- 线程I/O：线程执行某些IO操作，因为等待相关的资源而进入了阻塞状态。比如说监听system.in，但是尚且没有收到键盘的输入，则进入阻塞状态。
- 线程唤醒：Object类中的notify()方法，唤醒在此对象监视器上等待的单个线程。如果所有线程都在此对象上等待，则会选择唤醒其中一个线程，选择是任意性的，并在对实现做出决定时发生。类似的方法还有一个notifyAll()，唤醒在此对象监视器上等待的所有线程。



### 死亡

线程会以以下三种方式之一结束，结束后就处于死亡状态:

- run()方法执行完成，线程正常结束。
- 线程抛出一个未捕获的Exception或Error。
- 直接调用该线程的stop()方法来结束该线程——该方法容易导致死锁，通常不推荐使用。



## 线程安全和不安全

### 线程安全

*就是某个函数在并发环境中调用时，能够处理好多个线程之间的共享变量，是程序能够正确执行完毕。也就是说我们想要确保在多线程访问的时候，我们的程序还能够按照我们的预期的行为去执行，那么就是线程安全了。*



### 线程不安全

不安全代码：

```java
public class TestThread {

    private static class XRunnable implements Runnable{
        private int count;
        public void run(){
            for(int i= 0; i<5; i++){
                getCount();
            }
        }

        public void getCount(){
            count++;
            System.out.println(" "+count);
        }
    }

    public static void main(String[] args) {
        XRunnable runnable = new XRunnable();
        Thread t1 = new Thread(runnable);
        Thread t2 = new Thread(runnable);
        Thread t3 = new Thread(runnable);
        t1.start();
        t2.start();
        t3.start();
    }
}
结果：   
 2
 3
 2
 5
 4
 7
 6
 10
```



从代码上进行分析，当启动了三个线程，每个线程应该都是循环5次得出1到15的结果，但是从输出的结果，就可以看到有两个2输出，出现像这种情况表明这个方法根本就不是线程安全的。**我们可以这样理解**：在每个进程的内存空间中都会有一块特殊的公共区域，通常称为**堆（内存）**，之所以会输出两个2，是因为进程内的所有线程都可以访问到该区域，当第一个线程已经获得2这个数了，还没来得及输出，下一个线程在这段时间的空隙获得了2这个值，故输出时会输出2的值。



*要考虑线程安全问题，就需要先考虑**Java并发的三大基本特性**：**原子性**、**可见性**以及**有序性**。*



### 原子性



- 原子性是指在一个操作中就是cpu不可以在中途暂停然后再调度，即不被中断操作，要不全部执行完成，要不都不执行。就好比转账，从账户A向账户B转1000元，那么必然包括2个操作：从账户A减去1000元，往账户B加上1000元。2个操作必须全部完成。

  

- 那程序中原子性指的是最小的操作单元，比如自增操作，它本身其实并不是原子性操作，分了3步的，包括读取变量的原始值、进行加1操作、写入工作内存。所以在多线程中，有可能一个线程还没自增完，可能才执行到第二部，另一个线程就已经读取了值，导致结果错误。那如果我们能保证自增操作是一个原子性的操作，那么就能保证其他线程读取到的一定是自增后的数据。



### 可见性



-  当多个线程访问同一个变量时，一个线程修改了这个变量的值，其他线程能够立即看得到修改的值。



- 若两个线程在不同的cpu，那么线程1改变了i的值还没刷新到主存，线程2又使用了i，那么这个i值肯定还是之前的，线程1对变量的修改线程没看到这就是可见性问题。



### 有序性



程序执行的顺序按照代码的先后顺序执行，在多线程编程时就得考虑这个问题。



### 如何确保线程安全

解决办法：使用多线程之间使用**关键字synchronized**、或者使用**锁（lock）**，或者**volatile关键字**。

**①synchronized**（自动锁，锁的创建和释放都是自动的）；

**②lock 手动锁**（手动指定锁的创建和释放）。

**③volatile关键字**

为什么能解决？如果可能会发生数据冲突问题(线程不安全问题)，只能让当前一个线程进行执行。代码执行完成后释放锁，然后才能让其他线程进行执行。这样的话就可以解决线程不安全问题。



#### synchronized关键字

##### **同步代码块**

```java
synchronized(同一个锁){
  //可能会发生线程冲突问题
}
```

将可能会发生线程安全问题地代码，给包括起来，也称为**同步代码块**。**synchronized**使用的锁可以是对象锁也可以是静态资源，如×××.class，只有持有锁的线程才能执行同步代码块中的代码。没持有锁的线程即使获取cpu的执行权，也进不去。

**锁的释放**是在**synchronized**同步代码执行完毕后自动释放。



**同步的前提：**

1，必须要有两个或者两个以上的线程 ，如果小于2个线程，则没有用，且还会消耗性能(获取锁，释放锁)

2，必须是多个线程使用同一个锁



**弊端**：多个线程需要判断锁，较为消耗资源、抢锁的资源。

eg:

```java
public class ThreadSafeProblem {
    public static void main(String[] args) {
        Consumer abc = new Consumer();
        // 注意要使用同一个abc变量作为thread的参数，
        // 如果你使用了两个Consumer对象，那么就不会共享ticket了，就自然不会出现线程安全问题
        new Thread(abc,"窗口1").start();
        new Thread(abc,"窗口2").start();
    }
}
class Consumer implements Runnable{
    private int ticket = 100;
    @Override
    public void run() {
        while (ticket > 0) {
            synchronized (Consumer.class) {
                if (ticket > 0) {
                    System.out.println(Thread.currentThread().getName() + "售卖第" + (100-ticket+1) + "张票");
                    ticket--;
                }
            }
        }
    }
}
```



#####  同步函数

*就是将**synchronized**加在方法上。*

**分为两种：**

第一种是**非静态同步函数**，即方法是非静态的，使用的**this对象锁**，如下代码所示

```java
public synchronized void sale () {
        if (ticket > 0) {
            System.out.println(Thread.currentThread().getName() + "售卖第" + (100-ticket+1) + "张票");
            ticket--;
        }
    }
```

第二种是**静态同步函数**，即方法是用static修饰的，使用的锁是**当前类的class文件（xxx.class）**。



##### 多线程死锁线程



如下代码所示，

线程t1，运行后在同步代码块中需要oj对象锁，，运行到sale方法时需要this对象锁

线程t2，运行后需要调用sale方法，需要先获取this锁，再获取oj对象锁

那这样就会造成，两个线程相互等待对方释放锁。就造成了死锁情况。简单来说就是：

同步中嵌套同步,导致锁无法释放。

```java
class ThreadTrain3 implements Runnable {
    private static int count = 100;
    public boolean flag = true;
    private static Object oj = new Object();
    @Override
    public void run() {
        if (flag) {
            while (true) {
                synchronized (oj) {
                    sale();
                }
            }
 
        } else {
            while (true) {
                sale();
            }
        }
    }
 
    public static synchronized void sale() {
        // 前提 多线程进行使用、多个线程只能拿到一把锁。
        // 保证只能让一个线程 在执行 缺点效率降低
        synchronized (oj) {
            if (count > 0) {
                try {
                    Thread.sleep(50);
                } catch (Exception e) {
                    // TODO: handle exception
                }
                System.out.println(Thread.currentThread().getName() + ",出售第" + (100 - count + 1) + "票");
                count--;
            }
        }
    }
}
 
public class ThreadDemo3 {
    public static void main(String[] args) throws InterruptedException {
        ThreadTrain3 threadTrain1 = new ThreadTrain3();
        Thread t1 = new Thread(threadTrain1, "①号窗口");
        Thread t2 = new Thread(threadTrain1, "②号窗口");
        t1.start();
        Thread.sleep(40);
        threadTrain1.flag = false;
        t2.start();
    }
}
```

#### Lock



*可以视为**synchronized的增强版**，提供了更灵活的功能。该接口提供了限时锁等待、锁中断、锁尝试等功能。**synchronized**实现的同步代码块，它的锁是自动加的，且当执行完同步代码块或者抛出异常后，锁的释放也是自动的。*

```java
Lock l = ...;
 l.lock();
 try {
   // access the resource protected by this lock
 } finally {
   l.unlock();
 }
```

但是**Lock锁**是需要手动去加锁和释放锁，所以**Lock**相比于**synchronized**更加的灵活。且还提供了更多的功能比如说

**tryLock()方法**会尝试获取锁，如果锁不可用则返回false，如果锁是可以使用的，那么就直接获取锁且返回true，官方代码如下：

```java
Lock lock = ...;
 if (lock.tryLock()) {
   try {
     // manipulate protected state
   } finally {
     lock.unlock();
   }
 } else {
   // perform alternative actions
 }
```

eg:

```java
/*
 * 使用ReentrantLock类实现同步
 * */
class MyReenrantLock implements Runnable{
    //向上转型
    private Lock lock = new ReentrantLock();
    public void run() {
        //上锁
        lock.lock();
        for(int i = 0; i < 5; i++) {
            System.out.println("当前线程名： "+ Thread.currentThread().getName()+" ,i = "+i);
        }
        //释放锁
        lock.unlock();
    }
}
public class MyLock {
    public static void main(String[] args) {
        MyReenrantLock myReenrantLock =  new MyReenrantLock();
        Thread thread1 = new Thread(myReenrantLock);
        Thread thread2 = new Thread(myReenrantLock);
        Thread thread3 = new Thread(myReenrantLock);
        thread1.start();
        thread2.start();
        thread3.start();
    }
}
```

查看结果可发现，只有当当前线程打印完毕后，其他的线程才可继续打印，线程打印的数据是分组打印，因为当前线程持有锁，但线程之间的打印顺序是随机的。

即调用**lock.lock()** 代码的线程就持有了“对象监视器”，其他线程只有等待锁被释放再次争抢。

#### volatile关键字



错误示范：

```java
class ThreadVolatileDemo extends Thread {
    public boolean flag = true;
 
    @Override
    public void run() {
        System.out.println("子线程开始执行");
        while (flag) {
        }
        System.out.println("子线程执行结束...");
    }
    public void setFlag(boolean flag){
        this.flag=flag;
    }
 
}
 
public class ThreadVolatile {
    public static void main(String[] args) throws InterruptedException {
              ThreadVolatileDemo threadVolatileDemo = new ThreadVolatileDemo();
              threadVolatileDemo.start();
              Thread.sleep(3000);
              threadVolatileDemo.setFlag(false);
              System.out.println("flag已被修改为false!");
    }
}
```

结果：

![image-20240321150031086](../images/image-20240321150031086.png)

虽然flag已被修改，但是子线程依然在执行，这里产生的原因就是**Java内存模型（JMM）** 导致的。

由于主线程休眠了3秒，所以子线程没有意外的话是一定会被执行run方法的。而当子线程由于调用start方法而执行run方法时，会将flag这个共享变量拷贝一份副本存到线程的本地内存中。此时线程中的flag为true，即使主线程在休眠后修改了flag值为false，子线程也不会知道，即不会修改自己副本的flag值。所以这就导致了该问题的出现。



**注意**：在测试时，一定要让主线程进行sleep或其他耗时操作，如果没有这步操作，很有可能在子线程执行run方法而拷贝共享变量到线程本地内存之前，主线程就已经修改了flag值。

##### Java内存模型

*在**Java内存模型**规定了所有的变量（这里的变量是指成员变量，静态字段等但是不包括局部变量和方法参数，因为这是线程私有的）都存储在**主内存**中，每条线程还有自己的**工作内存**，线程的工作内存中拷贝了该线程使用到的主内存中的变量（只是副本，从主内存中拷贝了一份，放到了线程的本地内存中）。**线程对变量的所有操作都必须在工作内存中进行，而不能直接读写主内存。** 不同的线程之间也无法直接访问对方工作内存中的变量，**线程间变量的传递均需要自己的工作内存和主存之间进行数据同步进行**。*



而JMM就作用于工作内存和主存之间数据同步过程。他规定了如何做数据同步以及什么时候做数据同步。

![image-image-20240321150944476](../images/image-20240321150944476.png)

**1. 首先要将共享变量从主内存拷贝到线程自己的工作内存空间，工作内存中存储着主内存中的变量副本拷贝；**

**2. 线程对副本变量进行操作，（不能直接操作主内存）；**

**3. 操作完成后通过JMM 将线程的共享变量副本与主内存进行数据的同步，将数据写入主内存中；**

**4. 不同的线程间无法访问对方的工作内存，线程间的通信(传值)必须通过主内存来完成。**



当多个线程同时访问一个数据的时候，可能本地内存没有及时刷新到主内存，所以就会发生线程安全问题

**JMM是在线程调run方法的时候才将共享变量写到自己的线程本地内存中去的，而不是在调用start方法的时候。**



##### 解决办法

当出现这种问题时，就可以使用**Volatile关键字**进行解决。

**Volatile 关键字的作用**是变量在多个线程之间可见。使用**Volatile关键字**将解决线程之间可见性，**强制线程每次读取该值的时候都去“主内存”中取值**。

只需要在flag属性上加上该关键字即可。

```
public volatile boolean flag = true;
```

子线程每次都不是读取的线程本地内存中的副本变量了，而是直接读取主内存中的属性值。

volatile虽然**具备可见性**，但是**不具备原子性**。



#### synchronized、volatile和Lock之间的区别

##### synochronizd和volatile关键字区别：

1）**volatile关键字**解决的是变量在多个线程之间的可见性；而**sychronized关键字**解决的是多个线程之间访问共享资源的同步性。

**tip：** final关键字也能实现可见性：被final修饰的字段在构造器中一旦初始化完成，并且构造器没有把 **“this”**的引用传递出去（this引用逃逸是一件很危险的事情，其它线程有可能通过这个引用访问到了"初始化一半"的对象），那在其他线程中就能看见final；

2）**volatile**只能用于修饰变量，而**synchronized**可以修饰方法，以及代码块。（**volatile**是线程同步的轻量级实现，所以**volatile**性能比**synchronized**要好，并且随着JDK新版本的发布，**sychronized关键字**在执行上得到很大的提升，在开发中使用**synchronized关键字**的比率还是比较大）；

3）多线程访问**volatile**不会发生阻塞，而**sychronized**会出现阻塞；

4）**volatile**能保证变量在多个线程之间的可见性，但不能保证原子性；而**sychronized**可以保证原子性，也可以间接保证可见性，因为它会将私有内存和公有内存中的数据做同步。

**线程安全**包含**原子性**和**可见性**两个方面。

对于用**volatile**修饰的变量，JVM虚拟机只是保证从主内存加载到线程工作内存的值是最新的。

**一句话说明volatile的作用**：实现变量在多个线程之间的可见性。



##### synchronized和lock区别：

1）**Lock**是一个接口，而**synchronized**是Java中的关键字，**synchronized**是内置的语言实现；

2）**synchronized**在发生异常时，会自动释放线程占有的锁，因此不会导致死锁现象发生；而**Lock**在发生异常时，如果没有主动通过**unLock()**去释放锁，则很可能造成死锁现象，因此使用**Lock**时需要在**finally**块中释放锁；

3）**Lock**可以让等待锁的线程响应中断，而**synchronized**却不行，使用**synchronized**时，等待的线程会一直等待下去，不能够响应中断；

4）通过**Lock**可以知道有没有成功获取锁，而**synchronized**却无法办到。

5）**Lock**可以提高多个线程进行读操作的效率（读写锁）。

**在性能上来说**，如果竞争资源不激烈，两者的性能是差不多的，而当竞争资源非常激烈时（即有大量线程同时竞争），此时**Lock**的性能要远远优于**synchronized**。所以说，在具体使用时要根据适当情况选择。

# 设计模式

## 详解

> https://blog.csdn.net/qq_38411796/article/details/130530259
>
> https://www.cnblogs.com/davidwang456/p/11328433.html

## 单例模式

> https://blog.csdn.net/2201_75437633/article/details/137201494

# 项目技术总结

## sql优化实例

- sql150行左右，未优化前30秒，优化后：3.7秒；20000条数据
- 方式：添加索引
  - 给sql中的用于查询的字段添加索引，字段值唯一，重复数据少，多用于sql的筛选条件字段
  - 控制临时表结果集大小
  - with 关键字，提前创建临时表
  - 通过执行计划查看影响sql速率的主要因素，进而针对性的进行优化

## 流程图，定时任务

## 启动本地服务时，报错接口被占用

>Identify and stop the process that's listening on port 8082 or configure this application to listen on another port.

1. cmd , 执行 netstat -ano | findstr :8082
2. 强制关闭：taskkill /PID 1234 /F

## 线上服务cpu占用过高怎么排查

1. top命令：找到cpu耗用最厉害的那个进程的PID
2. top -H -p 进程PID： 通过PID找到耗用的最厉害的线程的PID
3. printf '0x%x\n' 线程PID: 将线程PID转换为16进制
4. jstack 进程PID | grep 16进制线程PID  -A  20  : 20是显示多少行。通过该命令，可以看到该线程的状态，是否守护线程，线程的内存地址等等；找到导致cpu占用过高的代码进行修改  

# 参考文档

## JVM

<div class="responsive-pdf aspect-portrait">
    <iframe
        class="pdf-frame"
        src="/document/极简JVM教程-周瑜.pdf"
        type="application/pdf"
        aria-label="极简JVM教程 PDF"
        loading="lazy">
    </iframe>
</div>
