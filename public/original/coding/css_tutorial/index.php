<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<div id="css-tutorial-wrapper">
<div id="scroll-up" onclick="document.querySelector('#css-tutorial-wrapper').scrollIntoView({behavior:'smooth'});"><i class="fa fa-chevron-up"></i></div>
<!--html intro-->
<fieldset><legend><h4 id="css-intro">CSS INTRO</h4></legend>
<p class="" style="padding-left:4px;">CSS  stands for Cascading Style Sheet which is the language used to style the website and make it standout!. Before you continue with this css tutorial you need to have some knowlege about HTML.
 <br><br>   
<b style="font-size:16px; text-decoration:underline; margin-top: 5px;">Including CSS In the Webpage:</b><br>

  CSS can be included in the html webpages in three ways and these are: Internal, external and Inline styling.<br>

	<b>Internal Style</b>- This is where all the css codes are written within the webpage usually in the &lt;head&gt; section of the page. All the  css codes are written between the  style <span style="color:rgb(176 ,0, 24);">&lt;style&gt;</span> opening tag and <span style="color:rgb(176 ,0, 24);">&lt;/style&gt;</span>  closing tag.
  Through out this tutorial we will use the internal css styling.<br><br>
	<b>Example:</b> This example demostrates how internal CSS is used to apply styles to the  elements in the webpage.<br>

  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
	<span style="color:rgb(225 ,5, 10)"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white">{</span><span style="color:white;"><span class="w3-text-blue">color</span>:blue;</span><span style="color: white">}</span>
      <br>
<span style="color:rgb(225 ,5, 10)"> &lt;/style&gt;</span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white"> a blue color is applied to the texts</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>
<br>
	 <span style="display: inline-block; border: 1px solid black; padding: 4px; color: blue;">a blue color is applied to the texts</span><br><br>

	 <b>External Style</b>: This is where all the css codes are written in the separate file that has an extention of '<b>.css</b>'. Here all the  css codes are written without the  style <span style="color:rgb(218 ,72, 4);">&lt;style&gt; </span> tags. External css files are then included/referenced in the webpage using the  <span style="color:rgb(6 ,15, 165);"> &lt;link&gt; </span>  element that has two required attributes called the <b>href</b> that holds the css filename and its location and  the <b>rel</b> that stands for 'relationship'. The <span style="color:rgb(6 ,15, 165);"> &lt;link&gt; </span> element must be placed in the &lt;head&gt; section of  the page. <br>
	<b>Example:</b><br>
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
    <span style="color:rgb(225 ,5, 10)"> &lt;head&gt;</span><br>
	<span class="w3-text-blue">&lt;link</span><span class="w3-text-green">  href</span><span class="w3-text-white">="cssfile.css"</span><span class="w3-text-green">  ref</span><span class="w3-text-white">="stylesheet"</span><span style="color:blue;">&gt;</span>
  <br>  <span style="color:rgb(225 ,5, 10)"> &lt;/head&gt;</span>
</span>
	<br><br>

  <b>Inline Style</b>- This where all the css codes are written in the html elements using the <span class="w3-text-green"> style</span> attribute.<br>
  <b>Example:</b><br>
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
  <span style="color:rgb(225 ,5, 10)"> &lt;p </span>   <span style="color: blue"> <span class="w3-text-green">style</span><span class="w3-text-green">="<span class="w3-text-blue">color</span><span style="color: white;">:green;</span>"</span></span><span style="color:rgb(225 ,5, 10);">&gt;</span>
  <span style="color: white;">text changes to green in paragraph</span>
<span style="color:rgb(225 ,5, 10);"> &lt;/p&gt;</span>
</span><br>
<span style="display: inline-block; border: 1px solid black; padding: 4px; color: green;">text changes to blue in paragraph</span>
   <br>
   This example applies a green color to the texts in the  current paragraph only. Inline style only affects the element it is applied in.<br>
  Now that you know how to include CSS scripts in the webpage, Lets break it down now!.
</p>
</fieldset>


<!--css syntax-->
<fieldset><legend><h4 id="css-syntax"> CSS SYNTAX</h4></legend>
<p class="" style="padding-left:4px;">
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
	 <span style="color:rgb(200 ,10, 3)"> &lt;style&gt;</span><br>
      <span class="w3-text-green">selector</span><span class="w3-text-white">{</span> <span class="w3-text-blue">property</span><span style="color:white">:value</span><span class="w3-text-white">}</span>
      <br>

	 	 <span  style="color: rgb(200 ,10, 3)"> &lt;/style&gt;
     </span></span><br>
CSS syntax has the <b>selector</b> , <b>property</b> and  <b>value</b>. property and value are wrapped in the opening and closing curly brackets"{ }".<br>
<b>selector</b> is used to select an element which needs to be styled.An element can be selected using its id, class or name.<br>
An <b>id</b> is the unique identifier of an element and it's used to style a specific element and it can not be used on more than <b>one</b> element. an "Id" is always prefixed with an hashtag("#"). <br>

<b>example</b><br>
<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
 <span style="color: rgb(200 ,10, 3)"> &lt;style&gt;</span><br>
      <span class="w3-text-green">#id-name</span><span style="color: white;">{</span><span class="w3-text-blue">color</span> <span style="color:white">:red;</span><span style="color: white;">}</span>
      <br>
<span  style="color:rgb(200 ,10, 3)"> &lt;/style&gt;</span><br>

<span style="color:rgb(200 ,10, 3)"> &lt;p</span> <span class="w3-text-green">id</span><span style="color: white">="id-name"</span><span  style="color:rgb(200 ,10, 3)">&gt;</span><br>
<span style="color:white">Id is used to style me up! with the red color</span><br>

  <span style="color:rgb(200 ,10, 3)"> &lt;/p&gt;</span><br>
</span>
<br>
 <span style="display: inline-block; border: 1px solid black; padding: 4px; color:red;">Id is used to style me up! with the red color</span>
<br>
<b>Example explained:</b><br>
First the paragraph was created with an id  attribute that has a name called "id-name". Then the id name was used to select the paragraph element.Color was it's property with the value of red. So the id name acted as the element selector<br><br>

<b style="font-size:18px;">class</b> is an element selector used to apply styles on multiple elements with the same class name.Class selector is always prefixed with the period("<b>.</b>")  or a dot.  The class work just like an  id but the only difference is that a "class" can be used on multiple elements having same name while an "id" is only used on one element only.<br>

<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">

<span style="color: rgb(200 ,10, 3)">  &lt;style&gt;</span><br>
      <span class="w3-text-green">.class-name</span><span style="color:white">{</span><span class="w3-text-blue">color</span> <span style="color:white">:orange;</span> <span style="color:white">}</span>
      <br>
<span style="color: rgb(200 ,10, 3)">&lt;/style&gt;</span><br>

<span style="color:rgb(200 ,10, 3)"> &lt;p</span>  <span class="w3-text-green">class</span><span style="color: white">="class-name"</span><span style="color:rgb(200 ,10, 3)">&gt;</span><br><span class="w3-text-white"> A class is used to style me up! with a orange color</span><br>

  <span style="color:rgb(200 ,10, 3)">&lt;/p&gt;</span><br>
</span>
  
<br>
 <span style="display: inline-block; border: 1px solid black; padding: 4px; color:orange;">Class is used to style me up! with an orange color</span>
<br>
<br>
<b>Example Explained</b><br>
First the paragraph was created with a class attribute that has a name "class-name".Then  the class name was used to select the paragraph element.color was it's property with the value of green.The same class name can be used in multiple elements to apply the same style.


<br><br>

<b style="font-size:18px;">Element name:</b> is also as a selector without the less than "<" and greater than ">" symbols.This is very useful if you want to apply some styles to certain elements such as paragraphs.<br>


<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">p</span><span style="color: white;">{</span><span  class="w3-text-blue">color</span> <span style="color: white">:purple;}</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>

<span style="color: rgb(200 ,10, 3);"> &lt;p&gt;</span><br><span style="color:white" >Element name is used to style me up! with a red color</span><br>

  <span style="color: rgb(200 ,10, 3);"> &lt;/p&gt;</span><br>
</span>
<br>
  <span style="display: inline-block; border: 1px solid black; padding: 4px; color:purple;">Element name is used to style me up! with a purple color</span>
<br>
<b>Example explained</b><br>
First the paragraph was created without a <b>class</b> and  id attributes .Then  the element  name (paragraph)<b>"&lt;p&gt;"</b> was used to select the paragraph.color was it's property with the value of red.This style is applied to all the paragraphs in the webpage.
</p>
</fieldset>

<!--css backgrounds-->
<fieldset><legend><h4 id="css-backgrounds" >CSS BACKROUNDS</h4></legend>
<p class="" style="padding-left:4px;">
	Webpages can have a number of background styles using CSS.These background styles includes, color, images and others.<br>
	<b style="font-size:18px; text-decoration: underline;" id="background-color">BACKGROUND-COLOR</b><br>
	Different kinds of colors can be set to the background of the webpage.This is achieved through the use of elements, class and ids.<br>
	<b>Example</b><br>
	This example shows how to set the  background color of the whole webpage using the  &lt;body&gt; element.<br>
<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">

	<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white">{<span class="w3-text-blue">background-color</span>:blue;}</span>
      <br>
<span style="color: rgb(200 ,10, 3)"> &lt;/style&gt;</span><br>

<span style="color:rgb(200 ,10, 3)"> &lt;body&gt;</span><br>
<span style="color: white">All the  content in the body element will have blue color</span><br>
<span style="color:rgb(200 ,10, 3)"> &lt;/body&gt;</span><br> 
</span><br>

<div style="background-color:blue;color: white;
         text-align: center; margin: 10px 2px; padding:5px;">  All the content in the body element will have  a blue color</div>

<br> This shows that CSS selects whole web content using the &lt;body&gt; element and assigns it with the desired background-color which is blue in our example.As you have seen, the whole page has the background color of blue, However, you can apply the background to the specific parts of the web page using the previous explained <b>id</b>  and <b> class</b> attributes.<br>

<b>Example:</b><br>
	This example shows how a <b>&lt;div&gt;</b> block element can be used to style just part of the webpage content using either an id or class names.<br>
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">

	<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">#style-1</span><span style="color:white">{<span class="w3-text-blue">background-color</span>:black;}</span>
      <br>
       <span class="w3-text-green">.style-2</span><span style="color:white">{<span class="w3-text-blue">background-color</span>:green;}</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>

<span style="color: rgb(200 ,10, 3);">&lt;div </span> <span class="w3-text-green">  style</span>  <span style="color: white">="<span class='w3-text-yellow'>height</span>:20%;"</span>   <span class="w3-text-green">  id</span><span style="color: white;">="style-1"</span><span style="color: rgb(200 ,10, 3);">&gt;</span> <span style="color:white">i have a black background color</span>  <span style="color: rgb(200 ,10, 3);">&lt;/div&gt;</span> <br><br>

 <span style="color: rgb(200 ,10, 3);">&lt;div</span>  <span class="w3-text-green">  style</span> <span style="color:white">="<span class='w3-text-yellow'>height</span>:20%;"</span>  <span class="w3-text-green">   class</span><span style="color:white">="style-2"</span><span style="color: rgb(200 ,10, 3);">&gt;</span><span style="color:white">  i have a green  background color</span> <span style="color: rgb(200 ,10, 3);"> &lt;/div&gt;</span> 
</span>
<br><br>
  <div  style="background-color:black;color: white;
               text-align: center; margin:10px; padding:5px;"> i have a black background color</div>

 <div style="background-color:green;color: white;
               text-align: center; margin:10px; padding:5px;">   i have a green  background color</div>
<br><br>

<b style="font-size:18px; text-decoration: underline;" id="background-image">BACKGROUND-IMAGE</b><br>
	The background image can be set in the webpage through the use of css property background-image:url(). The image filename is placed in the url() parenthesis <br>
	<b>Example</b><br>
	This example shows how to set the  background image of the whole webpage.<br>
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
	<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color:white">{<span class="w3-text-blue">background-image</span>:url('image-filename');}</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
</span>

<style>
  	
     #bm{background-image:url('css_tutorial/photos/p.jpg');
     	   color: white;
         text-align: center;
         background-size:cover;}
  </style>
  <span  class="w3-block" style="height:50%;" id="bm"> we have  set the background image using any photo of our choice</span>
<br>

 <b style="font-size:18px; text-decoration: underline;" id="background-repeat">BACKGROUND-REPEAT</b><br>
<br> By default an image will repeat itself until it fits the whole page however this can be manipulated using the "background-repeat" property with the value of "no-repeat" that stops the repeatition of the image<br>
<b style="font-size:18px; text-decoration: underline;">NO-REPEAT</b><br>
<b>Example:</b><br>
	This example shows how a <b>background-repeat</b> property can be used to stop the image from repeating itself.<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
  <span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color:white">{<span class="w3-text-blue">background-image</span>:url('image-filename');<br>

     <span class="w3-text-blue" style="padding-left: 46px;">background-repeat</span>:no-repeat; 
         }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
</span>
<style type="text/css">
  	
     #br{background-image:url('css_tutorial/photos/p.jpg');
     	color: white;
         background-repeat: no-repeat;
          background-size:cover;
        }

     </style>
     <span  class="w3-block" style=" height:50%;" id="br"> The image now can not repeat itself</span><br><br>
     You can also use the same  "background-repeat" to repeat the image in either <b>y</b> or <b>x</b> direction using the values "repeat-x" or "repeat-y"<br> 
   <b style="font-size:18px; text-decoration: underline;">REPEAT-X</b><br>
<b>Example:</b><br>
	This example shows how an image can be repeated in the horizontal direction  using the <b>repeat-x</b> value.Please note that an image by default is repeated horizontally, so you will not see any difference<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
  <span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color:white">{<span class="w3-text-blue">background-image</span>:url('image-filename');<br>

     <span class="w3-text-blue" style="padding-left: 46px;">background-repeat</span>:repeat-x; 
         }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
</span>
<style type="text/css">
  	
     #bx{background-image:url('css_tutorial/photos/sodier.jpg');
     	color: white;
         background-repeat:repeat-x;
       }

     </style>
     <span  class="w3-block" style=" height:50%;" id="bx"> The image has been repeated horizontally</span><br><br>

<b style="font-size:18px;  text-decoration: underline;">REPEAT-Y</b><br>
     <b>Example:</b><br>
	The example below shows how an image can be repeated in the vertical direction  using the <b>repeat-y</b> value.<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
  <span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color:white">{<span class="w3-text-blue">background-image</span>:url('image-filename');<br>

     <span class="w3-text-blue" style="padding-left: 46px;">background-repeat</span>:repeat-y; 
         }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
</span><br>


<style type="text/css">
  	
     #by{background-image:url('css_tutorial/photos/sodier.jpg');
     	
         background-repeat:repeat-y;
        }

     </style>
     <div  class="w3-block" style=" height:80%;" id="by"> The image has been repeated vertically</div><br>

 <b style="font-size:18px; text-decoration: underline;" id="background-position">BACKGROUND-POSITION</b><br>
A background image can be positioned  using the" background-position" property.An image can be positioned at the right, left, center, top or bottom side of the web page.An image should not be repeated if it has to be positioned.<br>
<b>Example:</b><br>
	This example shows how a <b>background-position</b> can be used to position an image to the right side of the webpage.<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
  <span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color:white">{<span class="w3-text-blue">background-image</span>:url('image-filename');<br>

     <span class="w3-text-blue" style="padding-left: 46px;">background-repeat</span>:no-repeat; 
        
      <br>

      <span class="w3-text-blue" style="padding-left: 46px;">background-position</span>:right; 
         }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
</span>


<style type="text/css">
  	
     #bp{background-image:url('css_tutorial/photos/sodier.jpg');
     	color: white;
     	text-align: right;
         background-repeat: no-repeat;
        background-position: right;
       }

     </style>
     <span  class="w3-block" style=" height:50%;" id="bp"> The image has been positioned to  the right side of the webpage</span><br>

 <b style="font-size:18px; text-decoration: underline;" id="background-attachement">BACKGROUND-ATTACHEMENT</b><br>
 background-attachement is  the css property used to make a background image either move with the content during the  scrolling of the page or be static(fixed)  to its positon.This property accepts either of the two values which is <b>scroll</b> or <b>fixed</b>.
<br>
<b style="font-size:17x; text-decoration: underline;">FIXED BACKGROUND IMAGE</b><br>
<b>Example:</b><br>
	This example shows how background-image  can stay fixed to its position(not moving).Try to scroll your page and you will find that the image does not move.<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
  <span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color:white">{<span class="w3-text-blue">background-image</span>:url('image-filename');<br>

     <span class="w3-text-blue" style="padding-left: 46px;">background-repeat</span>:no-repeat; 
        
      <br>

      <span class="w3-text-blue" style="padding-left: 46px;">background-attachement</span>:fixed; 
         }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
</span><br>


<style type="text/css">
  	
     #bf{background-image:url('css_tutorial/photos/wal.jpg');
     	color: white;
     	
         background-repeat: no-repeat;
        background-attachment: fixed;
       background-size:cover;}

     </style>
     <span  class="w3-block" style=" height:50%;" id="bf"> The image is fixed to its position</span><br><br>

<br>
<b style="font-size:17x; text-decoration: underline;" id="SCROLLABLE-BACKGROUND-IMAGE">SCROLLABLE BACKGROUND IMAGE</b><br>
<b>Example:</b><br>
	This example shows how a background image can move with the content  as the user scrolls the page.Try to scroll your page and you will find that the image moves with the content.<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
  <span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color:white">{<span class="w3-text-blue">background-image</span>:url('image-filename');<br>

     <span class="w3-text-blue" style="padding-left: 46px;">background-repeat</span>:no-repeat; 
        
      <br>

      <span class="w3-text-blue" style="padding-left: 46px;">background-attachement</span>:scroll; 
         }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
</span><br>

<br>


<style type="text/css">
  	
     #bs{background-image:url('css_tutorial/photos/wal.jpg');
     	color: white;
         background-repeat: no-repeat;
        background-attachment: scroll;
        background-size:cover;}

     </style>
     <span  class="w3-block" style=" height:50%;" id="bs"> The image can move during scrolling</span><br><br>




</p>
</fieldset>




<!--CSS MARGIN-->
<fieldset><legend><h4 id="css-margin" >CSS MARGIN</h4></legend>
<p class="" style="padding-left:4px;">
	<b>margin</b> is the white space created outside the borders. Margins  creates some whites spaces that pushes  borders away from the  web browser's default alignments.margin is measured in pixes(px). <br>

		<b>Example:</b><br>
	This example shows a 30px  margin that creates a space between a defined border and web browser's screen.In order for you to notice the effects of margin, we have created the border line around the element.you will learn more about borders later<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">margin</span> <span style="color: white">:30px;</span> <br>
      <span style="padding-left: 53px;" class="w3-text-blue">border</span> <span style="color: white">:2px solid black;

      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>


<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">margin has been applied to all the four sides of the page: left, right , top and bottom</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>

</span>


<style type="text/css">
  	
     #margin{margin:30px;
            border:2px solid black;
           text-align: center;}

     </style>
     <div   style="height:20%;" id="margin"> margin has been applied to all the four sides of the page: left, right , top and bottom</div>
  
   <b style="font-size:18px; text-decoration: underline;">SPECIFIED MARGIN:</b><br>
NOTE that the above example applies the 30px margin to all the  four sides of the page: left, right, bottom and top. However, you can apply margin to  a specific side by using the <b> margin-left</b>, <b>margin-right</b> ,  <b>margin-top</b>  and <b>margin-bottom</b> 
<br>
<b>Example:</b><br>
	This example shows how margin can be created to the left side of the web page. we use 30px<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">margin-left</span> <span style="color: white">:30px;</span> <br>
      <span style="padding-left: 53px;" class="w3-text-blue">border</span> <span style="color: white">:2px solid black;

      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>


<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">Margin has been applied to the left side only</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>




</span>


<style type="text/css">
  	
     #margin-left{margin-left : 30px;
             border:2px solid black;}

     </style><br>
<div  style=" height:25%;" id="margin-left">Margin has been applied to the left side only</div><br>

</p>
</fieldset>



<!--css borders-->
<fieldset><legend><h4 id="css-border" >CSS BORDERS</h4></legend>
<p  style="padding-left:4px;">
	<b>border</b> is the   line drawn around the webpage.Borders in the webpage can be created using the three required properties: "border-width", "border-style" and  "border-color"<br>
<b>Example:</b><br>
	This example shows how to create a black solid border line around the page(this is short hand).<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
<span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">border</span> <span style="color: white">: 5px solid black}</span>

 <br>

<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>

<br>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">Am a solid black border line</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>


</span>


<style type="text/css">
  	
     #border{border:5px solid black;
         text-align: center;}

     </style>
     <br>
     <span  class="w3-block" style=" height:25%;" id="border"> Am a  solid black border line</span><br>
<b>Example explained:</b><br>
In the example above we used the <b>short hand</b> (short cut) of creating a border line with <b>'5px'</b> as the border-width , <b>'solid'</b> as the border-style and <b>'black'</b> as the border-color. Please note that when using the short hand, always follow the order as shown below else the border will not be applied. Always start with the border-width then border-style and lastly the border-color.<br>
<i>5px</i>=== <b>border-width</b><br>
<i>solid</i>=== <b>border-style</b><br>
<i>black</i>=== <b>border-color</b><br>
If the short hand seems to be difficult, you can still create the border line using the specific property: <b>border-width</b>, <b>border-style</b> and <b>border-color</b>.When you use the property names, the order does not matter!!
<br>
<b>Example:</b><br>
	This example shows how a dotted border line can be created by using its property names.<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">border-color</span> <span style="color: white">:red;</span> <br>
      <span style="padding-left: 53px;" class="w3-text-blue">border-style</span> <span style="color: white">:dotted;</span>

<br>
      <span style="padding-left: 53px;" class="w3-text-blue">border-width</span> <span style="color: white">:5px;

      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">Am a dotted red border line</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>


</span><br>


<style type="text/css">
  	
     #bo{border-width:5px;
     	    border-style: dotted;
     	    border-color: red;
         text-align: center;}

     </style>
     <span  class="w3-block" style=" height:30%;" id="bo"> Am a  dotted red border line</span><br>
<b>Example explained:</b><br>
In the example above we separately used border property names:border-width ,border-style and border-color to create a dotted border line.Always start with the border-width then border-style and lastly the border-color.<br>
<i>3px</i>=== <b>border-width</b><br>
<i>dotted</i>=== <b>border-style</b>: border-style can be "dotted", "solid" ,"groove" or "double" you can try them!<br>
<i>red</i>=== <b>border-color</b><br>

</p>
</fieldset>


<!--CSS PADDING-->
<fieldset ><legend><h4 id="css-padding" class="w3-blue">CSS PADDING</h4></legend>
<p class="" style="padding-left:4px;">
	<b>padding</b> is the  white space between the border and the content.Padding is measured in pixes(px).<br>

		<b>Example:</b><br>
	This example shows  how a 40px padding  can be applied to all sides of the page that creates a space between the border and the content.<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">padding</span> <span style="color: white">:40px;</span> <br>
      <span style="padding-left: 53px;" class="w3-text-blue">border</span> <span style="color: white">:2px solid black;

      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">padding has separated us from the border line<span style="color: rgb(200 ,10, 3);"> &lt;br&gt;</span>
ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>




</span>

<style type="text/css">
  	
     #padding{padding: 40px;
           border:2px solid black;}

     </style>

     <span  class="w3-block" style=" height:35%; word-wrap: break-word;" id="padding"> padding has separated us from the border line<br> 
      ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
    .</span><br>
<b style="font-size:18px; text-decoration: underline;">SPECIFIED PADDING:</b><br>
NOTE that the above example applies the 10px padding to the four sides of the page:left, right, bottom and top. However, you can apply padding to specific side by using the </b> padding-left, <b>padding-right</b> ,  <b>padding-top</b>  and <b>padding-bottom</b> 

<b>Example:</b><br>
	This example shows how padding can be created to the left side of the web page. we use  30px<br>
<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">padding-left</span> <span style="color: white">:30px;</span> <br>
      <span style="padding-left: 53px;" class="w3-text-blue">border</span> <span style="color: white">:2px solid black;

      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>


<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white; word-wrap: break-word;">left padding has been applied .This only affects the left part of the page<span style="color: rgb(200 ,10, 3);"> &lt;br&gt;</span>
ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>




</span>
<br>


<style type="text/css">
  	
     #padding-left{padding-left : 30px;
          border:2px solid black;
         word-wrap: break-word;}

     </style>
     <span  class="w3-block" style=" height:30%; " id="padding-left">left padding has been applied .This only affects the left part of the page<br>
          ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
     </span><br>

</p>
</fieldset>



<!--css texts-->
<fieldset><legend><h4 id="css-text" >CSS TEXTS</h4></legend>
<p class="" style="padding-left:4px;">
<b>Texts</b> are the fundamental elements of every document. Therefore CSS has the text properties that are used to manipulate the texts(fonts) in the webpage.This includes  text decoration, text-alignments, text-transformations  and more<br><br>

     <b style="font-size: 18"><u>TEXT DECORATION</u></b><br>
<b>text-decoration</b> is the property used to underline the texts in the webpage.<br>

<b>Example:</b><br>
	This example underlines the  all texts in the page<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">text-decoration</span> <span style="color: white">:underline;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">We have been underlined using the text decoration property</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>




</span>
<br>

<style type="text/css">
  	
     #text-decoration{text-decoration:underline;}

     </style>
     <span  style="display: inline-block; border: 1px solid black; padding: 4px; "  id="text-decoration">We have been underlined using the text decoration property</span><br><br>


     You can also remove the underlines from the texts by setting the <b>text-decoration</b> property to <b>none</b>.<br>

<b>Example:</b><br>
	This example removes all underlines from the texts<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">text-decoration</span> <span style="color: white">:none;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">Underlines have been removed from us!</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>

</span>

<style type="text/css">
  	
     #text-decoration-none{text-decoration:none;}

     </style>
     <br>
     <span  style="display: inline-block; border: 1px solid black; padding: 4px; "  id="text-decoration-none">Underlines have been removed from us!</span><br>



 <br>
     <b style="font-size: 18" id="text-align"><u>TEXT ALLGNMENT</u></b><br>
<b>text-allgn</b> is the property used to align texts to the left , center or right side of the page. By default texts are left alligned<br>

<b>Example:</b><br>
	This example aligns texts to the center the  of the page<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">text-align</span> <span style="color: white">:center;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">We have been aligned to the center of the page</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>



</span>

<style type="text/css">
  	
     #text-center{text-align:center;}

     </style>
     <br>
     <span  style="display:inline-block; border: 1px solid black; padding: 4px; "  id="text-center">We have been aligned to the center of the page</span><br>

     <br>
     The texts can also be aligned to the right side of the page by setting the <b>text-align</b> to <b>right</b><br>



<b>Example:</b><br>
	This example aligns texts to the right side of the page<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">text-align</span> <span style="color: white">:right;}</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span>
<span style="color: white">We have been aligned to the right</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>

</span>



<style type="text/css">
  	
     #text-right{text-align:right;}

     </style>
     <span style="display:inline-block; border: 1px solid black; padding: 4px; "  id="text-right">We have been aligned to the right</span><br>


     <br>
     <b style="font-size: 18" id="float"><u>FLOATING TEXT</u></b><br>
<b>float</b> is the property used to align texts either to the left or right side of the page. Unlike <b> text-align</b> which aligns texts to center, float only aligns texts either to the left or right side of the page and NOT to the center!<br>

<b>Example:</b><br>
	This example aligns texts to the right side of the page using float property<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">float</span> <span style="color: white">:right;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">texts floated to right</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>

</span>



<style>
  	
     #floating{float:right;
            margin-top: 20px;}

     </style>
     <span  style="display:inline-block; border: 1px solid black; padding: 4px; "  id="floating">texts floated to right</span><br>
     



<br>
     <b style="font-size: 18" id="text-align"><u>TEXT TRANSFORMATION</u></b><br>
<b>text-transform</b> is the property used to change texts  to the uppercase(capital letters) lowecase (small letters) or Captalise it. By default all the texts are lowercased (small letters)<br>

<b>Example:</b><br>
	This example changes texts to uppercase(capital letters)<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">text-transform</span> <span style="color: white">:uppercase;
      }</span>
      <br>


<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">We have been changed to uppercase</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span></span><br>
 



<style>
  	
 #upper{text-transform:uppercase;}

     </style>
    <b style="font-style: italic;">Resuit&gt;&gt;</b> <span   id="upper">We have been changed to uppercase</span><br><br>

Setting the <b>text-transform</b> property to <b>lowecase</b> will change the texts to small letters.To see the effect, try to write texts in capital letters and then apply the following code in the example below:<br>
     <b>Example:</b><br>
	This example changes  uppercased texts to lowecase(small letters)<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">text-transform</span> <span style="color: white">:lowercase;
      }</span>
      <br>


<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">WE HAVE BEEN CHANGED TO LOWERCASE</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span></span><br>


<style type="text/css">
    
     #uppercase{text-transform:lowercase;}

     </style>
    <b style="font-style: italic;">Resuit&gt;&gt;</b> <span   id="uppercase">WE HAVE BEEN CHANGED TO LOWERCASE</span>
     <br><br>
     You can also use
      the <b>text-transform:</b> to captalise each first letter in  the sentence by setting it to <b>captalize</b>. Each word begins with capital letter in the sentence<br>
     <b>Example:</b><br>
	This example captalises each first letter of the texts <br>
	
     <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">text-transform</span> <span style="color: white">:captalise;
      }</span>
      <br>

<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">we have been captalised</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span></span><br>
<style type="text/css">
  	
     #captalise{text-transform:uppercase;}

     </style>
     <b style="font-style: italic;">Resuit&gt;&gt;</b><span   id="captalise">we have been captalised</span><br>
     

</p>

</fieldset>

<!--CSS FONTS-->

<fieldset><legend><h4 id="css-font" class="w3-teal">CSS FONTS</h4></legend>
<p class="" style="padding-left: 4px;"> <b>font</b> property defines the  size ,weight, boldness, family and styles of  texts.<br>



<b style="font-size: 18"><u>FONT SIZE</u></b><br>
<b>font-size</b> is the property used to either increase or decrease the size of the texts in the web page. font-size is measured either in px or ems.<br>

<b>Example:</b><br>
  This example increases the size of texts to  30px in the webpage<br>
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">font-size</span> <span style="color: white">:25px;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">our size has been increased by 25px using the font-size property</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>

</span>
<br>

<style type="text/css">
    
     #font-size{font-size:25px;}

     </style>
     <span   id="font-size" style="display: inline-block; border:1px solid black;">our size has been increased by 25px using the font-size property</span>
     <br>
     <br>Remember that the default font size is <b>16px</b> which is also equal to <b>1em</b>.Therefore 2em is equal to 32px.lets try it in the example below:<br>
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">font-size</span> <span style="color: white">:2em;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">our size has been increased by  2em (32px) using the font-size property</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>
<style type="text/css">
    
     #em{font-size:2em;}

     </style>
   <span  style="display: inline-block; border:1px solid black;" id="em">our size has been increased by  2em (32px) using the font-size property</span><br>

<br>

	<br>
     <b style="font-size: 18" id="text-align"><u>FONT FAMILY</u></b><br>
<b>font-family</b> is the property used to set the font family to the texts. These families include <b>serif</b>,  <b>verdana</b>,  <b>times new roman</b> and more<br>

<b>Example:</b><br>
	This example  has a font family of serif<br>
	 <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">font-family</span> <span style="color: white">:serif;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">We have "serif" font family</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>

<style type="text/css">
  	
     #serif{font-family: serif;}

     </style><br>
     <span  style="border: 1px solid black; display: inline-block; padding:4px;"  id="serif">We have "serif" font family</span><br>


<br>
     <b style="font-size: 18" id="font-weight"><u>FONT STYLE</u></b><br>
<b>font-style</b> is the property used  to italise texts(putting texts in italic)

<b>Example:</b><br>
	This example puts the texts in italic<br>
	 <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">font-style</span> <span style="color: white">:italic;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">We have been put in italic</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>


<style type="text/css">
  	
     #italic{font-style:italic;}

     </style>
     <br>
     <span  style="border: 1px solid black; display: inline-block; padding:4px;"  id="italic">We have been put in italic</span><br>


<br>
     <b style="font-size: 18" id="font-weight"><u>FONT WEIGHT</u></b><br>
<b>font-weight</b> is the property used  to  change texts into bold

<b>Example:</b><br>
	This example puts texts in bold<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">font-weight</span> <span style="color: white">:bold;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span style="color: white">We have been put in bold</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>


<style type="text/css">
  	
     #bold{font-weight:bold;}

     </style>
     <br>
     <span style="border: 1px solid black; display: inline-block; padding:4px;"    id="bold">We have been put in bold</span><br>



</p>
</fieldset>



<!--coments-->

<fieldset><legend><h4 id="css-display" >CSS DISPLAY</h4></legend>
<p class="" style="padding: 4px;"> <b>display</b> is the property used to put html elements in elther block  inline display.Display property is also used to hide html contents when it is set to <b>none</b><br>
	<b>inline display</b> is where all the selected the html elements such as texts, images  are put in a single line (same line). inline display does not create any new line<br>

<b>Example:</b><br>
	This example puts all the html contents in a single line<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">display</span> <span style="color: white">:inline;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">All the contents will be on a single line</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>
<style type="text/css">
  	
     #inline{display: inline;}

     </style>
     <br>
     <span  style="border: 1px solid black; display: inline-block; padding:4px;"   id="inline">All the contents will be on a single line</span><br>

<br>

<b>block display</b> is where  all specified html elements such as texts, images  start on different lines. Block display always  creates new line<br>

<b>Example:</b><br>
	This example puts all the html elements in block display<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">display</span> <span style="color: white">:block;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">All the elements will be on a different lines</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>
<style type="text/css">
    
     #inline{display: inline;}

     </style>
     <br>
     <span  style="border: 1px solid black; display: inline-block; padding:4px;"   id="inline">All the elements will be <br>on a different lines</span><br>

<br>
     <b>display:none</b> is used to hide all the selected elements in a web page. The display property is set to  none(means displaying nothing)<br>

<b>Example:</b><br>
	This example hides all the content in the <span style="color:blue;">&lt;body&gt;</span> element.you might get a blank page if all the contents are in the  <span style="color:blue;">&lt;body&gt;</span> element<br>

	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">display</span> <span style="color: white">:none;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">All the content will be hidden</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>
<style type="text/css">
  	
     #none{display:block;}

     </style>
     <span  class="w3-block"  id="none">All the content in  &lt;body&gt; element are hidden</span><br>

</p>
</fieldset>

<!--POSTION-->

<fieldset><legend><h4 id="css-position" >CSS POSTION</h4></legend>
<p class=""> <b>POSTION</b> is the property used to position html  contents.By default all the html contents are static and can not be positioned at any point unless the CSS position property is used.Position takes about three values:fixed, relative and absolute.<br>

	<br>
	<b><U>position:fixed</U></b> is used to make the html contents 'fixed' at a specified position using the top, left, bottom and right properties that take numerical values measured in px.<br>When an  html content such as an image is fixed, it can not move when a user scrolls the page.
<br>
<b>Example:</b><br>
	This  example makes the image fixed at the top of the page using its id name. you can enter your image filename  in the  <strong>src</strong> attribute and the image will be displayed at the top the page<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">#fixed</span><span style="color: white;">{ </span><span  class="w3-text-blue">position</span> <span style="color: white">:fixed;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-orange"> &lt;img </span><span class="w3-text-green">src</span><span style="color:white;">="your-image-filename" </span> <span class="w3-text-green">width</span><span style="color:white;">="50%" </span><span class="w3-text-green">id</span><span style="color:white;">="fixed"</span><span class="w3-text-orange">></span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>

 

<style type="text/css">
  	
     #fixed{position:fixed;
            top:0px;}

     </style>
     <br>

    

<br><br>
	<b><U>position:absolute</U></b> is used to  position html content  at any specified position using the top, left, bottom and right properties that take numerical values measured in px.<br>When an  html content such as an image is absolutely postioned, it  still  moves when a user scrolls the page and it overlaps any content beneath it.<br>

<b>Example:</b><br>
	This  example makes the image  absolutely positioned at the top of the page using its id name. Make sure you put the correct image filename in the <b>src</b> attribute.<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">#absolute</span><span style="color: white;">{ </span><span  class="w3-text-blue">position</span> <span style="color: white">:absolute;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-orange"> &lt;img </span><span class="w3-text-green">src</span><span style="color:white;">="your-image-filename" </span> <span class="w3-text-green">width</span><span style="color:white;">="50%" </span><span class="w3-text-green">id</span><span style="color:white;">="absolute"</span><span class="w3-text-orange">></span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>


<br><br>
	<b><U>position:relative</U></b> is used to make the html contents relatively postioned to the entire html contents. Elements can still have specified postion using the top, left, bottom and right properties.<br>When an  html content such as an image is relativey positioned, nothing changes to the page contents only that the postioned element can be located at any point in the page<br>

<b>Example:</b><br>
	This  example makes  the image relatively positioned to the elements using its id name<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">#fixed</span><span style="color: white;">{ </span><span  class="w3-text-blue">position</span> <span style="color: white">:relative;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>
<span class="w3-text-orange"> &lt;img </span><span class="w3-text-green">src</span><span style="color:white;">="your-image-filename" </span> <span class="w3-text-green">width</span><span style="color:white;">="50%" </span><span class="w3-text-green">id</span><span style="color:white;">="relative"</span><span class="w3-text-orange">></span>

<br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>

<style type="text/css">
  	
     #relative{position:relative;
           }

     </style><br>
<img src="photos/p.jpg"  width="50%" id="relative">

</p>
</fieldset>
<!--css colors-->
<fieldset><legend><h4 id="css-colors">CSS COLORS</h4></legend>
<p class="" style="padding-left: 4px;"><b>COLOR</b>  is the CSS property used to set the color of the texts in the web page.Different colors can be set by simply using there name such as red, green or black. another way of setting the color is by the using the <b>rgb(x,x,x)</b> where r stands red, g stands for green and b stands for blue. Colors can also be set using the Hexadecimal numbers represented by #xxx<br>

	<br>
     <b id="color-name"><u>USING COLOR NAMES:</u></b><br>
     setting   a color  to the texts  using its name  is the easiest way to go as the beginner. Just use any valid name of the color such as blue, black, red, yellow etc.
<br>
<b>Example:</b><br>
	This example will apply an orange color the texts in the webpage that are in the <br> 
  <span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">color</span> <span style="color: white">:orange;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">We have an orange color</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>
<style type="text/css">
  	
     #orange{color:orange;}

     </style>
     <br>
     <span  style="display: inline-block; border: 1px solid black; padding: 4px;"  id="orange">We have an orange color</span><br>

<br>
<b id="rgb()"><u>USING  THE RGB(X,X,X):</u></b><br>
     rgb(x,x,x) is another way of setting the text color in the webpage.<br><b>r=red</b><br><b>g=green</b><br><b>b=blue</b><br><b>x=numbers from 1-255</b><br>
     As shown above x represents three numbers one for red another for green and another blue. This most funny way of applying distinct colors to the texts as your job is just change the numbers in ranges of 1 to 255 and CSS will do the magic!!

<b>Example:</b><br>
	This example will generate a random  text color  using the rgb(x,x,x) method<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">color</span> <span style="color: white">:rgb(222,44,55);
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">We have a nice random color</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>

<style type="text/css">
  	
     #rgb{color:rgb(122,24,200);}

     </style><br>
     <span style="display: inline-block; border: 1px solid black; padding: 4px;"  id="rgb">We have a nice random color</span><br>
<br>
<b id="hexdecimal"><u>USING  THE HEXADECIMAL:</u></b><br>
     Just like the rgb(x,x,x), a color can also be set using the hexdecimal that takes values where  ranges for numerical value run form 0 to 9 and A TO F  for alphabetical. This means that you can use any letter between A and F and number from 0  to 9<br>
     Hexadecimal are always prefixed with an hashtag(#) then followed by elther three or six values which are the combination of letters(a-f) and number(0-9):<b>#42f54e</b><br>
<b>Example:</b><br>
	This example will also generate a random  text color  using the hexadecimal method #xxxxxx<br>
	<span style="border: 1px solid black; display: inline-block;  padding:7px; background-color: rgba(0 ,0, 0,0.9);">
<span style="color: rgb(200 ,10, 3);"> &lt;style&gt;</span><br>
      <span class="w3-text-green">body</span><span style="color: white;">{ </span><span  class="w3-text-blue">color</span> <span style="color: white">:#7af4gg;
      }</span>
      <br>
<span style="color: rgb(200 ,10, 3);"> &lt;/style&gt;</span>
<br>
<span style="color: rgb(200 ,10, 3);"> &lt;body&gt;</span><br>

<span style="color: white">We have a nice random color using hexadecimal</span><br>
<span style="color: rgb(200 ,10, 3);"> &lt;/body&gt;</span>
</span>


<style type="text/css">
  	
     #hex{color:#e4e;}

     </style>
<br>

     <span style="display: inline-block; border: 1px solid black; padding: 4px;"  id="hex">We have a nice random color using hexadecimal</span><br>
</p>
</fieldset>

</div>

<!--css topics-->
<!--
<div id="css-modal" class="w3-modal w3-animate-zoom ">
<div class="w3-modal-content" style="background:#034; color: #fff; font-size: 13px;">
  <span onclick="w3.hide('#css-modal');"  style="cursor:pointer;" class="w3-large w3-pink w3-display-topright w3-padding-small"> &times</span>
<ul style="list-style: none;" onclick="w3.hide('#css-modal');" >
<li  onclick="document.getElementById('css-intro').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;"> css intro</li> 
<li  onclick="document.getElementById('css-syntax').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;"> css syntax</li>  
<li onclick="document.getElementById('css-backgrounds').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;"> css backgrounds</li>
<li onclick="document.getElementById('css-margin').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;"> css margins</li>
<li onclick="document.getElementById('css-border').scrollIntoView({behavior:'smooth'});"  style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;">css borders</li>

<li onclick="document.getElementById('css-padding').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;">css paddings</li>


<li   onclick="document.getElementById('css-text').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;"> css text</li>
<li  onclick="document.getElementById('css-font').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;">css fonts</li>   
<li  onclick="document.getElementById('css-display').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;"> css display</li>  
<li  onclick="document.getElementById('css-position').scrollIntoView({behavior:'smooth'});" style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;"> css position</li>  
<li onclick="document.getElementById('css-colors').scrollIntoView({behavior:'smooth'});"  style="text-transform:uppercase;cursor:pointer; margin-bottom:25px;padding:10px 10px;">css colors</li>
</ul>

  </div>
  </div>
-->
