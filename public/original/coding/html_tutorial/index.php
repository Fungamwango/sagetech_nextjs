<meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no'>
<!--content begins here-->
<div id="html_tutorial_wrapper">
<div id="scroll-up" onclick="document.querySelector('#html_tutorial_wrapper').scrollIntoView({behavior:'smooth'});"><i class="fa fa-chevron-up"></i></div>
<!--html intro-->
<fieldset>
<legend><h4 id="html-intro">HTML INTRO</h4></legend>
<p>HTML stands for HyperText Markup Language and it is used to create web pages (website). HTML is the language that is made up of elements  that are used to format the web pages.HTML files have  a dot <b>".html"</b> extension name and are intrepreted by a web browser such as opera min and chrome.<br><br>
<b style="font-size:17px;">Creating the first html page:</b><br>
To  create and run the first html page, open your favourite text editor in your pc for example "Notepad"  in windows and then type the following:<br><br>
<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);
 padding: 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>

<span class="w3-text-orange"> &lt;h1&gt;</span><span style="color: white"> welcome to my webiste   </span><span class="w3-text-orange"> &lt;/h1&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
<br>
	<br> Then save the file as "<b>website.html</b>" and open it using your preferred web browser like chrome or opera min and below is the result:<br>
	<strong  style="display: inline-block; border:1px solid rgba(255, 255, 255, 0.2); font-size: 25px; padding: 10px; margin:7px 2px;" class="w3-center">  welcome to my webiste</strong>


<br>Congrates! you have just written your first webpage now lets break down the code you typed in your editor:<br>
First you typed the <span class="w3-text-red">&lt;html&gt;</span> element which specified that the document you are writing is <b>html</b>, then you typed <span class="w3-text-red">&lt;head&gt;</span>  element and this is where meta information such as website titles and styles are written, then you typed <span class="w3-text-red">&lt;body&gt;</span> element in where the main content of the webpage is written.All the web contents should be written between the <span class="w3-text-red">&lt;body&gt;</span> opening  and <span class="w3-text-red"> &lt;/body&gt;</span> closing tags.Finally you typed the <span class="w3-text-red">&lt;h1&gt;</span> that stands for 'heading' which had the 'welcome to my website' as its content. I know this might confuse you  but  you will understand them better later in the tutorial.
</p>
</fieldset>
<!--html elements-->
<fieldset><legend><h4 id="html-elements">HTML ELEMENTS</h4></legend>
<p class="">HTML comes with the set of elements that are used to structure and format html web contents. Html elements  are  wrapped between  the less than "<" and greater than ">" symbols. html contents are written between the opening and closing tags of the element. The opening and closing tags should have the same name or the code will not run as expected.
	<br><br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40); padding: 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>

<span class="w3-text-orange"> &lt;element&gt;</span><span style="color: white">  html content goes here   </span><span class="w3-text-orange"> &lt;/element&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	<br>The closing tag has the backslash that indicates the end of the element. The following  table shows a number of elements and their functions.
	<div  style="overflow-x: auto;">
	<table border="1">
	<tr>
		<th>Element</th>
		<th>Name</th>
		<th>Function</th>
</tr>	
<tr>
	<td class="element">&lt;html&gt;</td>
     	<td>html</td>
     <td>declares document type as html</td>
</tr>


<tr>
	<td class="element">&lt;p&gt;</td>
     	<td>paragraph</td>
     <td>creates a paragraph</td></tr>
<tr>
	<td class="element">&lt;h1&gt;</td>
     	<td>heading</td>
     <td>creates the heading of the content</td></tr>
<tr>
	<td class="element">&lt;input&gt;</td>
     	<td>input</td>
     <td>gets user inputs a single line(inline)</td>
</tr>
<tr>
	<td class="element">&lt;textarea&gt;</td>
     	<td>textarea</td>
     <td>gets user inputs from multiple lines</td>
</tr>

<tr>
	<td class="element">&lt;select&gt;</td>
     	<td>select</td>
     <td>creates a dropdown options of items</td>
</tr>

<tr>
	<td class="element">&lt;button&gt;</td>
     	<td>button</td>
     <td>creates a button</td>
</tr>
<tr>
	<td class="element">&lt;ul&gt;</td>
     	<td>unordered list</td>
     <td>creates unorderd list</td>
</tr>

<tr>
	<td  class="element">&lt;ol&gt;</td>
     	<td>ordered list</td>
     <td>Creates ordered list</td>
</tr>
<tr>
	<td class="element">&lt;li&gt;</td>
     	<td>list</td>
     <td>creates a list item</td>
</tr>
<tr>
	<td class="element">&lt;u&gt;</td>
     	<td>underline</td>
     <td>underlines a text</td>
     </tr>
     	<tr>
	<td class="element">&lt;hr&gt;</td>
     	<td>horizontal</td>
     <td>makes a horizontal line</td>
</tr>

<tr>
	<td class="element">&lt;style&gt;</td>
     	<td>style</td>
     <td> styles  an html contents</td>
</tr>

<tr>
	<td class="element">&lt;i&gt;</td>
     	<td>italic</td>
     <td>makes a text italic </td>
</tr>
<tr>
	<td class="element">&lt;b&gt;</td>
     	<td>bold</td>
     <td>makes the text bold</td>
</tr>
<tr>
	<td class="element">&lt;video&gt;</td>
     	<td>video</td>
     <td>creates a video</td>
</tr>
<tr>
	<td class="element">&lt;audio&gt;</td>
     	<td>audio</td>
     <td>creates an audio </td>
</tr>

<tr>
	<td class="element">&lt;img&gt;</td>
     	<td>image</td>
     <td>creates an image </td>
</tr>
<tr>
	<td class="element">&lt;title&gt;</td>
     	<td>title</td>
     <td>sets the title of the website </td>
</tr>
<tr>
	<td class="element">&lt;body&gt;</td>
     	<td>body</td>
     <td> defines the content of html </td>
</tr>
<tr>
	<td class="element">&lt;table&gt;</td>
     	<td>table</td>
     <td>used to create  a table </td>
</tr>
<tr>
	<td class="element">&lt;a&gt;</td>
     	<td>anchor</td>
     <td>used to create a link </td>
</tr>
<tr>
	<td  class="element">&lt;marquee&gt;</td>
     	<td>marquee</td>
     <td>used to animate text elther from right or left </td>
</tr>

<tr>
	<td class="element">&lt;link&gt;</td>
     	<td>link</td>
     <td>used to include external css files</td>
</tr>
	</table>
</div>
</p>
</fieldset>

<!--html attributes-->
<fieldset><legend><h4 id="html-attributes" >HTML ATTRIBUTES</h4></legend>
<p class="">
	Attributes are the set of html keywords that add more information about the elements.All elements accept attributes that go in a "name=value" pair.
	This example shows how the attribute can used to perform a certain task and in this case we will use the  "style" attributes to change the color of texts in the paragraph.
	<br><br>
<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;p </span>   <span style="color: blue"> <span class="w3-text-green">style</span><span class="w3-text-green">="<span class="w3-text-blue">color</span><span style="color: white;">:green;</span>"</span></span><span class="w3-text-orange">&gt;</span>
  <span style="color: white;">text changes to green in paragraph</span>
<span class="w3-text-orange"> &lt;/p&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border: 1px solid black; padding: 4px; color: green;">text changes to green in paragraph</span>
<br>
	<b style="font-size:17px;">Example explained:</b><br>

	First we created the paragraph <span class="w3-text-orange">&lt;p&gt;</span>with some contents in it , then we used the attribute called <b>style</b> to apply a green color to the paragraph contents <br><br>
	 The following  table shows some widely used attributes and their functions.
<br><br>
<div style="overflow-x: auto;">
	<table border="1">
	<tr>
		<th>attribute</th>
		<th>Function</th>
</tr>	
<tr>
	<td class="attribute">href</td>
     	<td>holds the url path name of the file</td>
</tr>


<tr>
	<td class="attribute">src</td>
     	<td>holds the file path location name</td>
     
</tr>
	<td class="attribute">alt</td>
     	<td>used as altenative when the image is broken</td>
<tr>
	<td class="attribute">style</td>
     <td>used to style html content inline</td>
</tr>
<tr>
	<td class="attribute">border</td>
     <td>used on tables to add border lines</td>
</tr>

<tr>
	<td class="attribute">id</td>
     <td>used as an unique element identifier</td>
</tr>

<tr>
	<td class="attribute">class</td>
     <td>used as the multiple elements identifier</td>
</tr>
<tr>
	<td class="attribute">disabled</td>
     <td>disables an html input or button</td>
</tr>

<tr>
	<td class="attribute">contenteditable</td>
     <td>enables html contents to be editable</td>
</tr>
<tr>
	<td class="attribute">readyonly</td>
     <td>allows the user to read the content only from the inputs</td>
</tr>
<tr>
	<td class="attribute">required</td>
     	<td>ensures that input or textarea has some values(not empty)</td>
     </tr>
     	<tr>
	<td class="attribute">maxlength</td>
     	<td>specifies the number of characters to be inserted</td>

</tr>

<tr>
	<td class="attribute">onclick</td>
     <td>excutes some functions when an element is clicked</td>
</tr>

<tr>
     	<td class="attribute">direction</td>
     <td>used to specify the direction of text either left or right</td>
</tr>
<tr>
	<td class="attribute">loop</td>
    <td>sets the number of times the text should run</td>
</tr>

	</table>
</div>
</p>
</fieldset>


<!--html heading-->
<fieldset><legend><h4 id="html-headings" >HTML HEADINGS</h4></legend>
<p class="">HTML headings are used to show/write the most important information such as an welcoming text on the website.heading are represented with  <b>&lt;h1&gt;</b> tag which run from 1 to 6.
	you have ever visted a website that welcomed you in some awesome big font text such as the one below: <strong style="font-size:30px;" class="w3-center " >  welcome to my site</strong><br> actually they use one the heading tags to  achieve this  and here you will know them  and use them in your website.<br>
	Headings are in six distinct categories and they vary in the font sizes and weight<br>
	<b>example</b><br>
<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);padding:5px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;h1&gt;</span>
  <span style="color: white;">Heading 1</span>
<span class="w3-text-orange"> &lt;/h1&gt;</span>
<br>
<span class="w3-text-orange"> &lt;h2&gt;</span>
  <span style="color: white;">Heading 2</span>
<span class="w3-text-orange"> &lt;/h2&gt;</span>
<br><span class="w3-text-orange"> &lt;h3&gt;</span>
  <span style="color: white;">Heading 3</span>
<span class="w3-text-orange"> &lt;/h3&gt;</span>
<br><span class="w3-text-orange"> &lt;h4&gt;</span>
  <span style="color: white;">Heading 4</span>
<span class="w3-text-orange"> &lt;/h4&gt;</span>
<br><span class="w3-text-orange"> &lt;h5&gt;</span>
  <span style="color: white;">Heading 5</span>
<span class="w3-text-orange"> &lt;/h5&gt;</span>
<br><span class="w3-text-orange"> &lt;h6&gt;</span>
  <span style="color: white;">Heading 6</span>
<span class="w3-text-orange"> &lt;/h6&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border:1px solid black;  padding: 5px;">
  <br>
    <span style="font-size:40px;">Heading 1</span><br><br>
	  <span style="font-size:35px;">Heading 2</span><br><br>
	 <span style="font-size:27px;">Heading 3</span><br><br>
	<span style="font-size:23px;">Heading 4</span><br><br>
    
	 <span style="font-size:19px;">Heading 5</span><br><br>
	 <span style="font-size:17px;">Heading 6</span><br>
	 </span>
	 <br><br>
	As you can see,  the heading 1 "&lt;h1&gt;" has the biggest font size and weight while  heading 6 "&lt;h6&gt;" has the smallest font size and weight.Moreover, all these heading  can be modified with the "style" attribute in any way such as  setting their text color, font size etc.<br>
	<b> example</b><br>
	 This example shows how we can set the background color of h1 by using the "style" attribute:<br>
	
<span style="border: 1px solid  rgba(255, 255, 255, 0.1); display: inline-block; background-color: rgb(10 ,26, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;h1 </span>   <span style="color: blue"> <span class="w3-text-green">style</span><span class="w3-text-green">="<span class="w3-text-blue">background-color</span><span style="color: white;">:blue;</span>"</span></span><span class="w3-text-orange">&gt;</span>
  <span style="color: white;">welcome</span>
<span class="w3-text-orange"> &lt;/h1&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>

<div style="font-size:40px; background: blue; padding:10px; margin:10px 2px;" class=" w3-center">welcome</div>

</p>
</fieldset>


<!--html marquee-->
<fieldset><legend><h4 id="html-marquee" >HTML MARQUEE</h4></legend>
<p class="">&lt;marquee&gt; is an element used to animate html texts either from right or left direction.marquee uses a set of attributes used to  manipulate the animation of texts.<br> <b>"direction"</b>  is the  attribute used to specify the direction of the animation either  right or left.If the direction is not set, texts who will animate from right to left. Therefore, the default direction is left <br>
<b>Example:</b><br>
<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40); padding:5px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;marquee </span>  <span class="w3-text-green"> direction</span><span style="color: white;">="right"</span><span class="w3-text-orange">&gt;</span>
  <span style="color: white;">hello world</span>
<span class="w3-text-orange"> &lt;/marquee&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span>
</span><br>

<marquee direction="right"  style="display: inline-block; border:1px solid black; font-size: 25px; padding: 10px; font-weight: bold;" class="w3-center"> hello world</marquee>

<br><br>
	 <b>"Loop"</b> is another optional attribute used to specify the number of times the texts should run  and stops.<br>
	 This example  uses a "loop" attribute to run the text twice(two times)and stops. You can kindly reload your page to see the effect:<br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;marquee </span>  <span class="w3-text-green"> direction</span><span style="color: white;">="left"</span>  <span class="w3-text-green"> loop</span><span style="color: white;">="2"</span><span class="w3-text-orange">&gt;</span>
  <span style="color: white;">hello world</span>
<span class="w3-text-orange"> &lt;/marquee&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span>
</span><br>

<marquee direction="left"  loop="2" style="display: inline-block; border:1px solid black; font-size: 25px; padding: 4px; font-weight: bold;" class="w3-center"> hello world</marquee>

<br>
</p>
</fieldset>


<!--html paragraph-->
<fieldset><legend><h4 id="html-paragraphs">HTML PARAGRAPHS</h4></legend>
<p ><b>&lt;p&gt;</b> is an  element used to make paragraphs in the web pages. it add some white spaces that separates one set of contents from the other on a new line.<br>
<b>Example: </b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;p&gt; </span>   
  <span style="color: white;">This is a paragraph</span>
<span class="w3-text-orange"> &lt;/p&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border: 1px solid black; padding: 4px;">This is a paragraph</span>
<br>
	 <br>
	 <b style="font-size:18"> <u>Creating a New Line:</u></b><br>

	 <b>&lt;br&gt;</b> is a "break"  element used to create a new line in html. its'an empty element that does not take any text and therefore it needs no closing tag. if the  <b>&lt;br&gt;</b>  is not used in html, all the inline elements will be in  a single line.<br>
	 

	 <b>Example:</b><br>
	 This example  shows how  a <b>&lt;br&gt;</b> "break" is used to create a new line in the webpage <br>

	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;P&gt;</span>
  <span style="color: white;">some texts in paragraph <span class="w3-text-orange"> &lt;br&gt;</span>
texts on new line
</span>
<span class="w3-text-orange"> &lt;/P&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span>
</span><br>

<span   style="display: inline-block; border:1px solid black;  padding: 4px;" class="w3-center">some texts in paragraph<br>
texts on new line</span>

<br>
	 
</p>
</fieldset>



<!--html span/ div-->
<fieldset><legend><h4 id="html-span/div" >HTML SPAN/DIV</h4></legend>
<p class=""><b>&lt;span&gt;</b> is an html inline element used to put items in a single line.<b>span</b> is commonly used to make some inline styles such as changing the font size, color of the texts and more. Besides, span element does not create any newline and this is  why it's used in <b>inline styling</b>.<br>
<b>Example:</b><br>
This example shows how span can be  used to apply some styles in the paragraph<br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;p&gt; </span>   
  <span style="color: white;">i have a black color <span class="w3-text-blue"> &lt;span  <span class="w3-text-green">style</span><span class="w3-text-white">="color:blue;"</span>&gt;</span>
 <span style="color: white;"> i have a blue color with the help of span </span>
    <span class="w3-text-blue"> &lt;/span&gt; </span>  </span><br>
<span class="w3-text-orange"> &lt;/p&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border: 1px solid black; padding: 4px;">i have a black color <span style="color:blue;"> i have a blue color with the help of span </span>
</span>
<br>
	 <br> <br>

	 <b>&lt;div&gt;</b> is an html block element used to put items in a new line.Each <b>div</b> starts on a different newline everytime it's used  as it creates break. Div is also used to group elements together which need a special style<br>
<b>Example:</b><br>
The example below shows how a &lt;div&gt; element is used in the webpage. We have added the 'style' attribute to change the color of the text to orange.<br>
	  <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;p&gt; </span>   
  <span style="color: white;">i have a black color <span class="w3-text-blue"> &lt;div  <span class="w3-text-green">style</span><span class="w3-text-white">="color:orange;"</span>&gt;</span>
 <span style="color: white;">texts have blue color starts on a new line </span>
    <span class="w3-text-blue"> &lt;/div&gt; </span>  </span><br>
<span class="w3-text-orange"> &lt;/p&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border: 1px solid black;  padding: 4px;">i have a black color <span style="color:orange;"> <br>we have a orange color and we on a new line </span>
</span>
<br>
</p>
</fieldset>


<!--STYLE-->

<fieldset><legend><h4 id="html-style" >HTML STYLE</h4></legend>
<p class=""> <b>style</b>  is an html attribute used to style the elements. Style has a "property":"value" format of styling webpages however style attribute can not be used to apply one style  to the entire webpage as its an inline attribute and as the result all the styles apply only to the current element where it is used. The example below will change the color of the texts in the paragraph to red.<br>
	<b>example:</b><br>
	
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;p    
    <span class="w3-text-green">style</span><span class="w3-text-white">="color:red;"</span>&gt;</span>
 <span style="color: white;">my color has been changed to red </span>
   <br>
<span class="w3-text-orange"> &lt;/p&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border: 1px solid black; padding: 4px; color: red;">my color has been changed to red 
</span><br>
<b>Example explained:</b><br>

		style has been given a property which is "color" and its value which is "red" as the result, the color of the text in the paragraph are changed to red as expected.<br>
<br>
		<b class=" w3-left">CHANGING THE FONT SIZE:</b><br>
		The <b>font-size</b> property is used to change the font size of the text like this:<br>
<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;p    
    <span class="w3-text-green">style</span><span class="w3-text-white">="font-size:25px;"</span>&gt;</span>
 <span style="color: white;"> i have a font size of 25 pixes </span>
   <br>
<span class="w3-text-orange"> &lt;/p&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border: 1px solid black; padding: 4px; font-size: 25px;"> i have a font size of 30 pixes
</span><br><br>

		<b style="text-align: left;" class="">Example explained:</b>
		style has been given a property which is<b> "font-size"</b>and its value which is always a numerical value "30".font-size is measured in either <b>em</b> or <b>px</b>. You can give the fonts(texts) any size you want using this method.<br><br>

		<b class="" style="text-align: left;">SETTING THE BACKGROUNG COLOR:</b>
		The <b>background-color</b> property is used  to set the background color of  the contents in the element:<br>
 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;p    
    <span class="w3-text-green">style</span><span class="w3-text-white">="background-color:green;"</span>&gt;</span>
 <span style="color: white;">my color has been changed to red </span>
   <br>
<span class="w3-text-orange"> &lt;/p&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<span style="display: inline-block; border: 1px solid black;  padding: 4px; background-color:green;"> i have a background color of green
</span><br>
<br>

		<b style="text-align: left;" class="">Example explained:</b>
		<b>style</b> attribute has been given a property which is  "background-color" and the color value of "green".<br>
		You will learn more about website styling when you take the cascading style sheet(CSS) tutorial.
		
</p>
</fieldset>



<!--coments-->

<fieldset><legend><h4 id="html-comments" >HTML COMMENTS</h4></legend>
<p class=""> <b>comments</b> in html are texts in the code which are ignored by the web browser and  this enables  programmers to  'comment' their codes which helps them to remember  the meaning  of every piece code. A web browser ignores every content written  between <b>&lt;!--</b> and <b>--&gt;</b><br>
	<b>example:</b><br>
	<span style="border: 1px solid black;  display: inline-block; background-color: rgb(10 ,20, 40); padding: 5px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;!--</span>
 <span style="color: white;"> this is a comment</span>
<span class="w3-text-blue"> --&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
<br>
		The less than symbol, exclamation mark and double hyphen  <b>&lt;!--</b> represent the start of the comment while  the double hyphen  and greater than symbol <b>--&gt;</b> represent the end of the comment.<br> Therefore if this code is run nothing is going to show in the web browser because it's ignored
</p>
</fieldset>

<!--LINKS-->

<fieldset><legend><h4 id="html-links">HTML LINKS</h4></legend>
<p class=""> <b>Links</b> are the keystone in the website as they enable users to jump from one web page to the other within the website.Links in html are created with the anchor <b>&lt;a&gt;</b> element  which contains the <b>"href"</b> attribute which specifies the file url(uniform resource locator).
	<b>example:</b><br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40)">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-orange"> &lt;a    
    <span class="w3-text-green">href</span><span class="w3-text-white">="home.html"</span>&gt;</span>
 <span style="color: white;">Home page</span>
   <br>
<span class="w3-text-orange"> &lt;/a&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<a  style="display: inline-block; border: 1px solid black; padding: 4px; color: blue; text-decoration: underline; cursor: pointer;"> Home page
</a><br>
	<br>
		<b>Example explained:</b><br>
		The above example demostrates how a user can be taken to the "home page" of the website which has been created with the filename of "home.html".The "href"  is the required  attribute that contains the url or the filename and in our case is "home.html" and this is what enables page named "home.html" to  be loaded.<br>The content between the opening and closing tags of the element acts as the link that can be clicked and by default it's blue in color and underlined.<br>Please note that if you don't put any characters or texts between the tags,the web browser is not going to show any link.
</p>
</fieldset>

<!--tables-->

<fieldset><legend><h4 id="html-tables">HTML TABLES</h4></legend>
<p class=""> <b>Tables</b>  can be created in html document through the use of <b>&lt;table&gt;</b> element as the main element with some sub elements whichs include:<br> <b><span style="color:blue;">&lt;tr&gt;</span></b> which stands for "table row" which creates a cell<br> <span style="color:blue;"><b> &lt;td&gt;</b> </span> which stands for "table data" which creates a row and<br> <span style="color:blue;"><b>&lt;th&gt;</b> </span> which stands for table headings(headers) which makes columns.<br>
	<b>example:</b><br>


<span style="border: 1px solid black;  display: inline-block; background-color: rgb(10 ,20, 40); padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
 

<span class="w3-text-orange">&lt;table <span class="w3-text-green">border</span><span style="color: white"> ="1"</span>&gt;</span><br>
<span class="w3-text-yellow">&lt;tr&gt;</span><br>
<span class="w3-text-blue">&lt;th&gt;</span>
<span style="color: white">name</span>
<span class="w3-text-blue">&lt;/th&gt;</span><br>


<span class="w3-text-blue">&lt;th&gt;</span>
<span style="color: white">age</span>
<span class="w3-text-blue">&lt;/th&gt;</span><br>


<span class="w3-text-yellow">&lt;/tr&gt;</span><br>


<span class="w3-text-yellow">&lt;tr&gt;</span><br>
<span class="w3-text-blue">&lt;td&gt;</span>
<span style="color: white">chanda</span>
<span class="w3-text-blue">&lt;/td&gt;</span><br>


<span class="w3-text-blue">&lt;td&gt;</span>
<span style="color: white">23</span>
<span class="w3-text-blue">&lt;/td&gt;</span><br>


<span class="w3-text-yellow">&lt;/tr&gt;</span><br>

<span class="w3-text-orange">&lt;/table&gt;</span>
 <br>


<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<br>
 	<div class="w3-center">
 		<div  style="overflow-x: auto;">
	<table border="1" style="border-collapse:">
		<tr>
			
<th>name</th>
<th>age</th>
</tr>
<tr>
<td>chanda</td>
<td>23</td>
</tr>
	</table>
</div>
</div><br>
 The <b>Border</b>   attribute in the table element adds the border line of 1px across the table. If the border is not included, you will end up with the table  without borders lines and it  makes less sense!! so don't forget to include it.
</p>
</fieldset>

<!--list-->

<fieldset><legend><h4 id="html-list" >HTML LIST</h4></legend>
<p class=""> <b>Lists</b> can be created in the html document just like in other document!!.There are two types of list and these are: <b> ordered list</b>  which is represented by  &lt;ol&gt;   element and <b>unordered list</b> element that is represented by  &lt;ul&gt; element:<br>
	<b style="font-size: 17px;"><u>Unorderd List:</u></b><br>
	<b>example:</b><br>
This example shows how unorderd list is created in the webpage<br>

	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;ul&gt;</span>
    <br>
    <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> Unordered list 1 </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> Unordered list 2 </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;">Unordered list 3 </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
<span class="w3-text-blue"> &lt;/ul&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>

<ul>
	<li> Unordered list 1</li>
	<li>Unordered  list 2</li>
	<li> Unordered  list 3</li>
</ul>
<br>

<br>
	<b style="font-size: 17px;"><u>Orderd List:</u></b><br>
	<b>example:</b><br>
This example shows how orderd list is created in the webpage<br>

	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>

  <span class="w3-text-blue"> &lt;ul&gt;</span>
    <br>
    <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> ordered list  </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> ordered list  </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> ordered list  </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
<span class="w3-text-blue"> &lt;/ul&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>

<ol>
	<li> ordered list </li>
	<li>ordered list </li>
	<li> ordered list </li>
</ol>

	<b style="text-transform: uppercase; text-decoration:underline; font-size: 18px;">Changing list markers</b><br>
	 By default ordered lists are marked by numbers while unordered list are marked by black circles. however these list markers can be modified.<br>
	 <b>ordered list markers</b><br>
	 Ordered list markers can be changed using the <strong>type</strong> attribite in  the &lt;ol&gt; element.<br>
	 <b>Example:</b><br>
	 This example sorts list items in an uppercased alphabetical order.<br><br>
	 
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>

  <span class="w3-text-blue"> &lt;ul <span class="w3-text-green">type</span><span class="w3-text-white">="A"</span>&gt;</span>
    <br>

    <span class="w3-text-orange"> &lt;li&gt;</span>

 <span style="color:white;">List item</span>


 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
<span class="w3-text-blue"> &lt;/ul&gt;</span>
<br> 
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>

<ol type="A">

	
	<li>list item</li>
	<li>list item</li>
	<li>list item</li>
</ol>
Please note that by putting a small letter 'a' in the type attribute, marks the list items with small alphabeltical order.<br>

<b>Example:</b><br>
	 This example sorts list items in a lowercased(small letters)alphabetical order.<br><br>
	 <span style="border: 1px solid black;  display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;ul <span class="w3-text-green">type</span><span class="w3-text-white">="a"</span>&gt;</span>
    <br>
    <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
<span class="w3-text-blue"> &lt;/ul&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
<ol type="a">
	
	<li>list item</li>
	<li>list item</li>
	<li>list item</li>
</ol>

<br><b><u>Roman Numeral Marks:</u></b><br>
List items can also be marked by roman numerals and this can be done by just putting small letter "i" for lowercase numerals or a capital leter "I" for  upppercased numerals in the <b>type</b> attribute.<br><br>

<b>Example:</b><br>
	 This example sorts list items in a lowercased(small letters)roman numerals.<br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;ul <span class="w3-text-green">type</span><span class="w3-text-white">="i"</span>&gt;</span>
    <br>
    <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
   <span class="w3-text-orange"> &lt;li&gt;</span>
 <span style="color: white;"> List item   </span>
 <span class="w3-text-orange"> &lt;/li&gt;</span>
   <br>
<span class="w3-text-blue"> &lt;/ul&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
<ol type="i">
	
	<li>list item</li>
	<li>list item</li>
	<li>list item</li>
</ol>
</p>
</fieldset>





<!--html iframe-->
<fieldset><legend><h4 id="html-iframes" >HTML IFRAME</h4></legend>
<p class=""><b>&lt;iframe&gt;</b> is an  element used to  create a webpage within a "webpage", sounds confusing right?? you can simply load another website in your own website using an iframe.An iframe is commonly used to embed youtube videos in the website.<br>
<b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;iframe <span class="w3-text-green">src</span><span class="w3-text-white">="filename/website url"</span>&gt;</span>  
<span class="w3-text-blue"> &lt;/iframe&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
<iframe style="width:100%; height:50%;" src="www.chandamark.tk" allowfullscreen></iframe>
	 <br><br>
	 <b style="font-size:18"> <u>Embending Youtube Videos:</u></b><br>

	Youtube videos can be included in your website by simply getting the iframe script from a video.Go to youtube and play a video and then tap on the <b>share</b> link and then choose "embed iframe" then copy the all  iframe scripts and paste it in your own website.<br>
	The iframe comes with set of attributes and the common ones are <b>height</b> and <b>width</b> attributes which are used set the width and height of the frame.<br>
	<b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">


	<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;iframe <span class="w3-text-green">src</span><span class="w3-text-white">="filename/website url"</span>  <span class="w3-text-green">height</span><span class="w3-text-white">="50"</span>   <span class="w3-text-green">width</span><span class="w3-text-white">="100"</span>&gt;</span> <br> 
<span class="w3-text-blue"> &lt;/iframe&gt;</span>
<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
This example gives the iframe the height of 50px and width of 100px. Remember that height and width attributes should be given unitless values therefore don't include units such as "px" or "em".The <b>src</b> is the required attribute where the  filename or the url of the website is placed.Therefore if the height and width attribute are not set, the iframe is going to use the default values.
	 
</p>
</fieldset>


<!--html images-->
<fieldset><legend><h4 id="html-images" >HTML IMAGES</h4></legend>
<p class=""><b>&lt;img&gt;</b> is an element that stands for "image" and it's used to add images in  the website. &lt;img&gt; element has a  required "<b>src</b>" source attribute that accepts the image file name.It also has the  <b>height</b> and <b>width</b> attributes which are used to set the height and width of an image. <br>It also has the <b>alt</b>  attribute which stands for 'altenative' that is used to display some texts when the image is broken( image fails to show). &lt;img&gt; is  an empty element and it does not have the closing tag.<br>
<b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;img <span class="w3-text-green">src</span><span class="w3-text-white">="image-filename"</span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span>&gt;</span>  

<br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
	  <img style="" width="50%" src="photos/p.jpg"/>
	 <br><br>
	 This example shows an image with the width of "50%".please note that you don't necessarily need to set the value of the <b>height</b> as it is set automaticaly when you set the width.Make sure that that you use the correct filename(basename) in the <b>src</b> attribute else the image will no show!
	 
</p>
</fieldset>


<!--html  videos-->
<fieldset><legend><h4 id="html-video" >HTML VIDEOS</h4></legend>
<p class=""><b>&lt;video&gt;</b> is an element that stands for "video" and it's used to add videos in  the website. &lt;video&gt; has a "<b>src</b>" source attribute that accepts the video file name.it also has the <b>height</b> and <b>width</b> attributes which are used to set the height and width of an video.besides, &lt;video&gt; element has a powerful attribute which is almost a required called<b> controls</b> which provides all the basic video controls such as pausing/playing the video, adjusting the volume of the video, casting and downloading the video. Therefore you just need to add the <b>controls</b> attribute which is a "boolean"<br>
 
<b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;video <span class="w3-text-green">src</span><span class="w3-text-white">="video-filename"   </span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span>  <span class="w3-text-green">controls</span>&gt;</span>  

<br>
<span class="w3-text-blue"> &lt;/video&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
	  <video style="" width="50%" src="videos/video.mp4" controls="true"></video>
	 <br><br>
	 <b style="font-size: 19px;">Repeating The Video:</b><br>
	 <b>loop</b> is an attribute that keeps repeating the video when it finishes<br>

	 <b>Example:</b><br>
	 This example shows how to add a loop attribute to video element that repeats when it finishes playing<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;video <span class="w3-text-green">src</span><span class="w3-text-white">="video-filename"   </span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span>  <span class="w3-text-green">controls</span>  <span class="w3-text-green">loop</span>&gt;</span>  

<br>
<span class="w3-text-blue"> &lt;/video&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
	 
	 <br><br>
	 <b style="font-size: 19px;">Autoplaying The Video:</b><br>
	 <b>autoplay</b> is an attribute used to 'autoplay' the video when the webpage loads. You don't have to press the "play" button as the  video begins playing by itself "automatically"<br>
	 <b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;video <span class="w3-text-green">src</span><span class="w3-text-white">="video-filename"   </span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span>  <span class="w3-text-green">controls</span>  <span class="w3-text-green">autoplay</span>&gt;</span>  

<br>
<span class="w3-text-blue"> &lt;/video&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 
	 <br><br>
	 <b style="font-size: 19px; text-transform:capitalize;"><u>adding a video poster(thumbnail):</u></b><br>
	 <b>Poster</b> is a video attribute used to add a video poster that represent the content of the video. a poster can be an image which is associated with the video content.For example if the video is about wrestilling, you can use the image of "john cena or undertaker".<br> if the poster is not included, the initial pictures of the video are used as the "poster".<br>
	 <b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;video <span class="w3-text-green">src</span><span class="w3-text-white">="video-filename"   </span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span> <span class="w3-text-green">poster</span><span class="w3-text-white">="image-filename"</span>  <span class="w3-text-green">controls</span>  <span class="w3-text-green">loop</span>&gt;</span>  

<br>
<span class="w3-text-blue"> &lt;/video&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
	 <br>
	  <video style="" width="50%" src="videos/video.php" controls="true" poster="photos/wal.jpg"></video>


	 
	 
</p>
</fieldset>

<!--html  audio-->
<fieldset><legend><h4 id="html-audio" >HTML AUDIO</h4></legend>
<p class=""><b>&lt;audio&gt;</b> is an element that stands for "audio" and it's used to add audio files (music) in  the website. &lt;audio&gt; has a "<b>src</b>" source attribute that accepts the audio file name, this is where we put the name of the audio file such as song .Besides, &lt;audio&gt; element has a almost required attribute called <b>controls</b> which provides all the basic audio controls such as pausing/playing the audio, adjusting the volume of the audio and downloading the audio.<br>
 
<b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;audio <span class="w3-text-green">src</span><span class="w3-text-white">="audio-filename"   </span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span>  <span class="w3-text-green">controls</span>&gt;</span>  

<br>
<span class="w3-text-blue"> &lt;/audio&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
	  <audio style="" width="50%" src="coding/mortals.mp3" controls="true"></audio>
	 <br><br>
	 <b style="font-size: 19px;">Repeating The Song:</b><br>
	 <b>loop</b> is an attribute that keeps repeating the song when it finishes<br>

	 <b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;audio <span class="w3-text-green">src</span><span class="w3-text-white">="audio-filename"   </span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span>  <span class="w3-text-green">controls</span>  <span class="w3-text-green">loop</span>&gt;</span>  

<br>
<span class="w3-text-blue"> &lt;/audio&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span>
	 <br>
	 <br>
	 <audio style="" width="50%" src="coding/mortals.mp3" controls="true"></audio>
	 <br><br>
	 <b style="font-size: 19px;">Autoplaying The Song:</b><br>
	 <b>Autoplay</b> is an attribute used to autoplay the song when the webpage loads. You don't have to press the "play" button as the  song begins playing by itself "automatically" after the webpage finishes loading<br>
	 <b>Example:</b><br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;audio <span class="w3-text-green">src</span><span class="w3-text-white">="audio-filename"   </span> <span class="w3-text-green">width</span><span class="w3-text-white">="50%"</span>  <span class="w3-text-green">controls</span>  <span class="w3-text-green">autoplay</span>&gt;</span>  

<br>
<span class="w3-text-blue"> &lt;/audio&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <audio style="" width="50%" src="coding/mortals.mp3" controls="true"></audio>
	 <br><br>
</p>
</fieldset>


<!--html forms-->
<fieldset><legend><h4 id="html-form" >HTML FORMS</h4></legend>
<p class=""><b>&lt;form&gt;</b>
is the element used to process the data collected from the various input fields.forms are widely used in the scripting languages such as PHP and  JAVASCRIPT.<br>
<b>Form</b> element has the required attribute called <b>method</b> which shows how the form should be submitted wheather in "GET" or "POST" method. It also has the  <b>action</b> attribute that specificies the location where the form will be processed<br>
<b>Example:</b><br>
<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;form <span class="w3-text-green">method</span><span class="w3-text-white">="POST"  </span> <span class="w3-text-green">action</span><span class="w3-text-white">="filename.html"</span> &gt;</span> <br> 
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="text"  </span>&gt;</span><br>

<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="submit"  </span>&gt;</span>

<br>
<span class="w3-text-blue"> &lt;/form&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<input type="" name=""><input type="submit" name=""><br>
	
	 <b style="font-size:18px;"> Action attribute:</b><br>
<b>action</b> is the form attribute used to add the name of the file that will process the data entered in the input fields after the form is submitted.you will learn more on 'action' and 'method' attributes in PHP tutorial
	
</p>
</fieldset>


<!--html inputs-->
<fieldset><legend><h4 id="html-inputs" >HTML INPUT</h4></legend>
<p class=""><b>&lt;input&gt;</b> is an  element used to collect data from the user in a single line(inline).The <b>input</b> element has a number of attributes which are used to modify the input field.<br><br>
	<b style="font-size: 19px; text-transform: capitalize;">type attribute:</b><br>
	<b>type</b> is the  required input attribute and it's used to specify data type to be entered in the field. These data types includes the following:<br><br>
	<b>text</b>-This accepts texts,numbers etc(all characters on the keyboard)<br>

	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="text"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="text" name="">
<br><br>
	<b>number</b>-This accepts numbers only(0-9)<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="number"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="number" name="">
<br><br>
	<b>date</b>-This enables the user to set the date<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="date"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="date" name="">

	<br><br>
	<b>color</b>-This enables the user to set the color<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="color"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="color" name="">


	 <br><br>
	<b>checkbox</b>-This enables the user to select multiple items by checking  the  boxes<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="checkbox"  </span>&gt;</span><span style="color:white;">Tomatoes</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="checkbox"  </span>&gt;</span><span style="color:white;">Lemons </span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="checkbox" name="">Tomatoes<br>
     <input type="checkbox" name="">Lemons 

   <br><br>
	<b>radio</b>-This enables the user to choose only one value from multiple options of values. For example, Radio buttons are used to the gender of the person which can only be either male or female.<br>Now in order to pick only one value from multiple values, all the inputs should have the same name as seen in the example below<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="radio" </span> <span class="w3-text-green">name</span><span class="w3-text-white">="gender"  </span>&gt;</span><span style="color:white;">Male</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="radio" </span>  <span class="w3-text-green">name</span><span class="w3-text-white">="gender"</span>&gt;</span>
<span style="color:white;">Female </span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>

	 <input type="radio" name="gender">Male <br>
     <input type="radio" name="gender">Female

<br><br>
	<b id='submit'>submit</b>-This creates a  button  used to submit the form. this only works when the form method attribute has "POST" or "GET" values else the button will not send the form anywhere<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;form <span class="w3-text-green">methods</span><span class="w3-text-white">="POST"  </span> <span class="w3-text-green">action</span><span class="w3-text-white">="filename.html"</span> &gt;</span> <br> 
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="text"  </span>&gt;</span><br>

<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="submit"  </span>&gt;</span>

<br>
<span class="w3-text-blue"> &lt;/form&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<input type="" name=""><input type="submit" name=""><br>
	


	<br><br>
	<b>password</b>-This transforms texts into asterics "*" or stars. Try to type something in the box and see how every character is converted into"stars or dots "<br>
	
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="password"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="password">


<br><br>
<b style="font-size:18px;">OTHER INPUT ATTRIBUTES:</b><br>
	Apart from <b>type</b> attribute,there are different input attributes which are used after the expected data type has been set and these include the following:<br><br>
<b>placeholder</b>-These are texts that tell the purpose of the input box.These texts disapper when the user begins entering or typing there own values.Placeholders can also act as labels of the input box.<br>

	
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">placeholder</span><span class="w3-text-white">="enter your name"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="text" placeholder="enter your name">	
 <br><br>
 <b>maxlength</b>-This  specifies the number of characters to be accomodated in the input field.The example below accomodates only 5 characters in the input field<br>

	
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">maxlength</span><span class="w3-text-white">="5"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="text" maxlength="5" value="12345">

	 <br><br>
 <b>value</b>-This  sets a pre-defined value in the input field.This is also used to set a name of the submit button when the <b>type</b> attribute is equal to <b>submit </b>.Users can then change the pre-defined values in the inputs if they want <br>

	
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">value</span><span class="w3-text-white">="Am a pre-defined value"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="text" maxlength="5" value="Am a pre-defined value">	

	 <br><br>
 <b>Required</b>-This  ensures that the input field has some values or is not empty. Required  attribute is used in form handling where it makes sure that all the input fields have some values. <br>
 In the example below try to click the submit button without entering any values and see what happens.<br>

	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
  <span class="w3-text-blue"> &lt;form <span class="w3-text-green">methods</span><span class="w3-text-white">="POST"  </span> <span class="w3-text-green">action</span><span class="w3-text-white">="filename.html"</span> &gt;</span> <br> 
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="text"  </span>   <span class="w3-text-green">required</span>&gt;</span><br>

<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="submit"  </span>&gt;</span>

<br>
<span class="w3-text-blue"> &lt;/form&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
<form style="display: inline;">
<input type="" name="" required=""><input type="submit" name=""></form><br>
	

 <br><br>
 <b>disabled</b>-This is used to disable input fields and buttons so that they become uninteractive with the user.When the "disabled" is set the user will not do anything with both input field and button.<br>

	
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="text"  </span>  <span class="w3-text-green">placeholder</span><span class="w3-text-white">="am disabled"  </span> <span class="w3-text-green">disabled</span>&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">type</span><span class="w3-text-white">="submit"  </span> <span class="w3-text-green">disabled</span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="text" placeholder="Am disabled" disabled="">	<br>
	 <input type="submit" disabled="">	


<br><br>
 <b>readonly</b>-This is used make pre-defined values in the input field "uneditable". This means that the user can only read the values and  never change them as they can not be edited by any means. Try typing something in the input field below and you will see that nothing is done<br>

	
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">value</span><span class="w3-text-white">="i can not be edited"  </span> <span class="w3-text-green">readonly</span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	
	 <input type="text" readonly value="i can not be edited">	<br>

 <br>
 <b>name</b>- A name is used as a variable that stores all the input values.For example, if the users enters a number, it gets stored in the name's attribute value.<b>name</b>attribute is commonly used in programing languages such as <b style="color: blue; text-decoration: underline;">PHP</b> during form handling.<br>

	
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;input <span class="w3-text-green">name</span><span class="w3-text-white">="emali"  </span> <span class="w3-text-green">placeholder</span><span class="w3-text-white">="enter your email"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <input type="email"  name="email" placeholder="enter email">	<br>
	 So if the email address is entered it will be stored in the 'email' name.

 
	
</p>
</fieldset>

<!--html textarea-->
<fieldset><legend><h4 id="html-textarea" >HTML TEXTAREA</h4></legend>
<p class=""><b>&lt;textarea&gt;</b> is an input element that accepts users inputs in multiple lines(block).remember that <b>input</b> element accepts user inputs in single line however users can like to enter many characters in the fields such as sending a text message or other data that may require many characters and this is where a textarea is used.<br><b>textarea</b> has two special attributes which are <b>rows </b>  and <b>cols</b><br> which stands for  columns <br>
	<b>rows</b> is used to set the height of the textarea while <b>cols </b> is used to set the width of the textarea.Both <b> rows </b>  and <b> cols </b>  accept unitless numerical values.<br>
Example:<br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;textarea <span class="w3-text-green">cols</span><span class="w3-text-white">="20"  </span> <span class="w3-text-green">rows</span><span class="w3-text-white">="8"  </span>&gt;</span><br>
<span style="color: white;"> this is the textarea that has multiple lines</span><br>
<span class="w3-text-blue"> &lt;/textarea&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 <br>
	  <textarea cols="20" rows="8" allowfullscreen> this is the textarea that has multiple lines</textarea>
	 <br><br>
	 By using the  <b>rows </b>  and <b>cols</b> , a textarea can be adjusted in any kind of height and width. Also remember that the <b>textarea</b> accepts all the <b>input</b> element  attributes  such as type, name, maxlength, required, disabled, in short all the attributes you saw in the <b>input</b> element. 

</p>
</fieldset>



<!--html button-->
<fieldset><legend><h4 id="html-button" >HTML BUTTON</h4></legend>
<p class=""><b>&lt;button&gt;</b> is an element used create a button in the website that can be clicked to perform some functions.<br>
Example:<br>
	 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;button </span><br>
<span style="color: white;"> Click here</span><br>
<span class="w3-text-blue"> &lt;/button&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	  <button>Click here</button>

</p>
</fieldset>


<!--html select-->
<fieldset><legend><h4 id="html-select" class="">HTML SELECT</h4></legend>
<p class=""><b>&lt;select&gt;</b> is an element used create a "dropdown" menu in the website.<b>select</b> element has sub-elements called <b>&lt;option&gt;</b> which are used to create options of items to select from. In the example below, click on the dropdown button and select one color from the options <br>
<b>Example:</b><br>

<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span style="color: white;">pick one color:</span><br>
<span class="w3-text-blue"> &lt;select&gt; </span><br>
<span  class="w3-text-orange">&lt;option<span style="color: white;"> value="red"</span>&gt;</span>
      <span style="color: white;"> red</span>
	 <span  class="w3-text-orange">&lt;/option&gt;</span><br>

	 <span  class="w3-text-orange">&lt;option <span style="color: white;">value="black</span>"&gt;</span>
   <span style="color: white;">black</span>
	 <span  class="w3-text-orange">&lt;/option&gt;</span><br>



	 <span  class="w3-text-orange">&lt;option <span style="color: white;">value="blue"</span>&gt;</span>
  <span style="color: white;">blue</span>
	 <span  class="w3-text-orange">&lt;/option&gt;</span><br>

<span class="w3-text-blue"> &lt;/select&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
	 
	 <span style="display:inline-block; border: 1px solid black; ">
	 <br>
	 pick one color:<select>
	 	
 <option>red</option>
<option>black</option>
<option>blue</option>
	 </select></span>
<br><br>
The <b>value</b> attribute holds the real value of the option item. if the value is not set, the dropdown menu will not return any values.
</p>
</fieldset>



<!--html javascript-->
<fieldset><legend><h4 id="html-javascript" >HTML JAVASCRIPT</h4></legend>
<p class="">HTML allows inline javascript programming  to add some "actions to the website" as html alone is boring and static!.
javascript attribute can be included in any html elements however the most prefered elements are <b>button</b> and <b>input</b> elements which are more interactive.<br> HTML uses a number of javascript attributes to enable programmers to  write some javascript codes and here we just pick the most widely used  two  javascript attributes which are <b>onclick</b> and <b>onkeyup</b>:<br>
<br>
 <b>onclick</b>-This is used to perform some functions when any specified element is clicked.The example below displays the current date  when the button is clicked.Try to click the 'check date' button to display the current date and time<br>
	<span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;button <span class="w3-text-green">onclick</span><span class="w3-text-white">="this.innerHTML=Date()"  </span>&gt;</span><br>
<span style="color:white;">Check date</span><br>
<span class="w3-text-blue"> &lt;/button </span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>
		
	<button onclick="this.innerHTML=Date()">Check date</button>
<br><br>
 <b>onkeyup</b>-This is used to perform some function when any key on the keyboard is pressed and released.The example below displays the user's name as they begin typing it into the  input field.javascript will select a  &lt;div&gt;  element by its id nsme called 'result' and then apply the values from the input into its inner html content. Try it and see!!<br>
 <span style="border: 1px solid black; display: inline-block; background-color: rgb(10 ,20, 40);  padding: 4px 60px 4px 4px;">
<span style="color: rgb(220 ,75, 3);"> &lt;html&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;head&gt;</span><br>
   <span style="color: rgb(220 ,75, 3);"> &lt;title&gt;</span><span style="color: rgb(220 ,75, 3);"> &lt;/title&gt;</span><br>

<span style="color: rgb(220 ,75, 3);"> &lt;/head&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-blue"> &lt;div <span class="w3-text-green">id</span><span class="w3-text-white">="result"  </span> &gt;</span>
<span class="w3-text-blue"> &lt;/div&gt; </span><br>

<span class="w3-text-blue"> &lt;input <span class="w3-text-green">onkeyup</span><span class="w3-text-white">="document.getElementById('result').innerHTML='your name is '+this.value;"  </span>&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/body&gt;</span><br>
<span style="color: rgb(220 ,75, 3);"> &lt;/html&gt;</span><br>
</span><br>

<span id="result">your name will show here</span><br>
<input type="text" onkeyup="getElementById('result').innerHTML='your name is '+this.value;" placeholder="enter your name">
		<br><br>
		Now that you have learnt the basics of HTML, you need to move on to cascading style sheet "CSS" which is used to style the webpages of the website.
</p>
</fieldset>

</div>

<!--html topics-->
<!--
<div id="html-modal" class="w3-modal w3-animate-zoom ">
<div class="w3-modal-content" style="background: #034; color:white; word-spacing: 1.8px; padding:20px 10px;">
<span onclick="w3.hide('#html-modal');"  style="cursor:pointer;" class="w3-large w3-pink w3-display-topright w3-padding-small"> &times</span>
<ul style="list-style: none;" onclick="w3.hide('#html-modal');" >
<li style="margin-bottom:20px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a  href="#html-intro" style="text-decoration:none; text-transform: uppercase;font-size: 13px;"> html intro</a></li>	
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-elements"> html elements</a></li>	
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-attributes">html  attributes</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-headings"> html headings</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-marquee"> html marquee</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-paragraphs"> html paragraphs</a></li>		
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-span/div"> html span/div</a></li>	
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-style"> html style</a></li>	
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-comments"> html comments</a>	</li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-links"> html links</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;"  href="#html-tables"> html tables</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;" ><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-list"> html list</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-iframes"> html iframe</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-images"> html images</a></li>
<li style="margin-bottom:25px;  text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-video"> html video</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-audio"> html audio</a></li>	
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-form"> html form</a>	</li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-inputs"> html inputs</a></li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-textarea"> html textarea</a>	</li>
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-button"> html button</a></li>	
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-select"> html select</a></li>	
<li style="margin-bottom:25px; text-transform:capitalize; 
	    cursor:pointer;
	    padding-top:10px;"><a style="text-decoration:none; text-transform: uppercase;font-size: 13px;" href="#html-javascript"> html javascript</a></li>			
</ul>
</div>
</div>
-->


<script>
	
//redirect
	if(location.href =='<?=$website_url;?>/coding/html_tutorial/' || location.href =='<?=$website_url;?>/coding/html_tutorial/index.php'){
		location.assign('<?=$website_url;?>/coding/?html=1');
	}

</script>