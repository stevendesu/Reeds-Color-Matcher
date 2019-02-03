var fileInput = document.getElementById("fileInput");
var hiddenImg = document.getElementById("hiddenImg");
var displayImg = document.getElementById("displayImg");
var ctx = displayImg.getContext("2d");

var selectedColor = document.getElementById("selectedColor");

function drawImage()
{
	var x = 0;
	var y = 0;

	var scaledWidth;
	var scaledHeight;
	
	var imgRatio = hiddenImg.width / hiddenImg.height;
	var canvasRatio = displayImg.width / displayImg.height;

	if (imgRatio < canvasRatio)
	{
		// Image is really tall - center horizontally
		scaledWidth = hiddenImg.width * (displayImg.width / hiddenImg.height);
		scaledHeight = displayImg.height;
		var diff = displayImg.width - scaledWidth;
		x = Math.floor(diff / 2);
	}
	else
	{
		// Image is really wide - center vertically
		scaledHeight = hiddenImg.height * (displayImg.height / hiddenImg.width);
		scaledWidth = displayImg.width;
		var diff = displayImg.height - scaledHeight;
		y = Math.floor(diff / 2);
	}
	// Scale the image to fill the canvas
	ctx.clearRect(0, 0, displayImg.width, displayImg.height);
	ctx.drawImage(hiddenImg, 0, 0, hiddenImg.width, hiddenImg.height, x, y, scaledWidth, scaledHeight);
}

// Handle file selection
fileInput.addEventListener("change", function()
{
	var file = fileInput.files[0];
	var reader = new FileReader();
	reader.addEventListener("load", function(e)
	{
		hiddenImg.src = e.target.result;
	});
	reader.readAsDataURL(file);
});
hiddenImg.addEventListener("load", drawImage);

// Handle click
function handleClick(e)
{
	var x = e.offsetX;
	var y = e.offsetY;
	// Grab color at mouse location
	var selected = ctx.getImageData(x, y, 1, 1).data;
	selected = {
		r: selected[0],
		g: selected[1],
		b: selected[2]
	};
	selectedColor.style.backgroundColor = "rgb(" + selected.r + ", " + selected.g + ", " + selected.b + ")";
	// Convert to LAB color space
	selected = rgbToLab(selected);
	
	// Output
	selectedColor.innerText = "L: " + selected.l + ", a: " + selected.a + ", b: " + selected.b;
}
displayImg.addEventListener("click", handleClick);
displayImg.addEventListener("touchend", handleClick);

window.addEventListener("load", function()
{
	displayImg.height = displayImg.clientHeight;
	displayImg.width = displayImg.clientWidth;
});

window.addEventListener("resize", function()
{
	displayImg.height = displayImg.clientHeight;
	displayImg.width = displayImg.clientWidth;
	drawImage();
});

setTimeout(drawImage, 1000);