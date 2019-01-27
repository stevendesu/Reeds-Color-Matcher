var products = [
	{name: "Marine Green", rgb: "#5b9994", l: 59.10805225847071, a: -21.226190857419837, b: -3.6784908066149757},
	{name: "Polar White", rgb: "#eceaee", l: 92.94940675856375, a: 1.3865652933460204, b: -1.7073577561621978},
	{name: "Pure White", rgb: "#f0f2f3", l: 95.37132322963265, a: -0.4802109748781591, b: -0.7239902773891638},
	{name: "Ivory", rgb: "#f8e5c6", l: 91.71729056754174, a: 1.656383137754569, b: 17.466577278962724},
	{name: "Light Stone", rgb: "#cccab2", l: 80.9012951517415, a: -3.413358794217447, b: 12.23590317440182},
	{name: "Mocha Tan", rgb: "#b1946f", l: 63.07304270396091, a: 5.513673618457227, b: 23.62249483782255},
	{name: "Patina Green", rgb: "#6c7f56", l: 50.732539688376235, a: -14.743226861996806, b: 20.068934529424876},
	{name: "Forest Green", rgb: "#10411e", l: 23.620100253062212, a: -25.355816712479438, b: 16.671610864074317},
	{name: "Hawaiian Blue", rgb: "#426d7e", l: 43.65649215611061, a: -9.974711468208747, b: -14.073101039491442},
	{name: "Gallery Blue", rgb: "#073e60", l: 24.749218659104592, a: -2.869702094910026, b: -24.816415362180976},
	{name: "Barn Red", rgb: "#6e1f19", l: 24.84365555082487, a: 34.485380344076525, b: 23.69669225535797},
	{name: "Patriot Red", rgb: "#8c181b", l: 30.176223626166788, a: 47.10943479156751, b: 30.05415911558481},
	{name: "Burgundy", rgb: "#512127", l: 19.97780251791518, a: 23.13155469932593, b: 6.997576891800705},
	{name: "Cocoa Brown", rgb: "#513d30", l: 27.57351125957655, a: 6.69182059639839, b: 11.387590364387156},
	{name: "Metallic Copper", rgb: "#b15726", l: 47.370104755947565, a: 33.33327714850892, b: 43.74609331171564},
	{name: "Old Town Gray", rgb: "#898b8e", l: 57.78618033695284, a: -0.13107383719218602, b: -1.861751624888175},
	{name: "Clay", rgb: "#979888", l: 62.349757172680484, a: -3.3090894087378087, b: 8.295383054560146},
	{name: "Burnished Slate", rgb: "#342019", l: 14.586788153546088, a: 8.643665496877784, b: 8.697140696212212},
	{name: "Black", rgb: "#030303", l: 0.8225277727189955, a: 0.00011190395268756426, b: -0.0002214172336256759},
	{name: "Ash Gray", rgb: "#aca1a1", l: 67.1520048381346, a: 3.988802170038108, b: 1.4263941407061997},
	{name: "Evergreen", rgb: "#394f46", l: 31.58739822527197, a: -10.687857290307246, b: 2.5715400883672856},
	{name: "Charcoal Gray", rgb: "#565656", l: 36.5667013570487, a: 0.0023838545715193504, b: -0.004716585582842381},
];

var fileInput = document.getElementById("fileInput");
var hiddenImg = document.getElementById("hiddenImg");
var displayImg = document.getElementById("displayImg");
var ctx = displayImg.getContext("2d");

var selectedColor = document.getElementById("selectedColor");
var closestMatchDiv = document.getElementById("closestMatchDiv");
var closestComplementDiv = document.getElementById("closestComplementDiv");

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

	enableMagnification(displayImg, {
		radius: displayImg.clientWidth * 0.1,
		zoom: 8
	});
}

// Handle file selection
fileInput.addEventListener("change", function()
{
	var file = fileInput.files[0];
	var reader = new FileReader();
	reader.addEventListener("load", function(e)
	{
		disableMagnification(displayImg);
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
	var complement = {
		r: 255 - selected.r,
		g: 255 - selected.g,
		b: 255 - selected.b
	};
	// Convert to LAB color space
	selected = rgbToLab(selected);
	complement = rgbToLab(complement);
	// Find the closest matching product
	var closestMatch = null;
	var minDistance = 9e9;
	for (var i = 0; i < products.length; i++)
	{
		var distance = (
			Math.pow(selected.l - products[i].l, 2) +
			Math.pow(selected.a - products[i].a, 2) +
			Math.pow(selected.b - products[i].b, 2)
		);
		if (distance < minDistance)
		{
			minDistance = distance;
			closestMatch = products[i];
		}
	}
	// Find closest matching complementary product
	var closestComplement = null;
	var minDistance = 9e9;
	for (var i = 0; i < products.length; i++)
	{
		var distance = (
			Math.pow(complement.l - products[i].l, 2) +
			Math.pow(complement.a - products[i].a, 2) +
			Math.pow(complement.b - products[i].b, 2)
		);
		if (distance < minDistance)
		{
			minDistance = distance;
			closestComplement = products[i];
		}
	}
	// Output (TODO)
	selected = labToRgb(selected);
	selectedColor.style.backgroundColor = "rgb(" + selected.r + ", " + selected.g + ", " + selected.b + ")";
	closestMatchDiv.style.backgroundColor = closestMatch.rgb;
	document.getElementById("closestname").innerText = closestMatch.name;
	closestComplementDiv.style.backgroundColor = closestComplement.rgb;
	document.getElementById("complementary").innerText = closestComplement.name;
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
	disableMagnification(displayImg);
	displayImg.height = displayImg.clientHeight;
	displayImg.width = displayImg.clientWidth;
	drawImage();
});