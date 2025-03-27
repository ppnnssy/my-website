---
sidebar_position: 1
---


		Node
	- Node是对ES标准一个实现，Node也是一个JS引擎
	- 通过Node可以使js代码在服务器端执行
	- Node仅仅对ES标准进行了实现，所以在Node中不包含DOM 和 BOM	
	- Node中可以使用所有的内建对象
		String Number Boolean Math Date RegExp Function Object Array
		而BOM和DOM都不能使用
			但是可以使用 console 也可以使用定时器（setTimeout() setInterval()）
			
	- Node可以在后台来编写服务器
		Node编写服务器都是单线程的服务器
		- 进程
			- 进程就是一个一个的工作计划（工厂中的车间）
		- 线程
			- 线程是计算机最小的运算单位（工厂中的工人）
				线程是干活的
				
	- 传统的服务器都是多线程的
		- 每进来一个请求，就创建一个线程去处理请求
		
	- Node的服务器单线程的
		- Node处理请求时是单线程，但是在后台拥有一个I/O线程池
	
	
