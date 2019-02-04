var products = [
	{name: "Arctic White", rgb: "#e0dbe2", l: 88.0902740285124, a: 2.61676194514221, b: -2.81771365007006},
	{name: "Barn Red", rgb: "#832b22", l: 31.2550810566717, a: 36.6862028005417, b: 26.3450431863694},
	{name: "Black", rgb: "#161517", l: 7.31704371999303, a: 0.992455344686352, b: -1.06338287849328},
	{name: "Bright Red", rgb: "#a01d26", l: 34.8236085596387, a: 51.5467052569811, b: 30.0898585201577},
	{name: "Burgundy", rgb: "#532f31", l: 23.6720950283359, a: 16.8714173977054, b: 5.58524759361067},
	{name: "Burnished Slate", rgb: "#50443f", l: 30.0353193885052, a: 3.57563196781244, b: 4.58688454604211},
	{name: "Charcoal Gray", rgb: "#5c585b", l: 38.2705507263466, a: 2.42833359799924, b: -1.10614742791229},
	{name: "Clay", rgb: "#9f948a", l: 61.8704799198712, a: 2.30551451610161, b: 6.63311419676229},
	{name: "Cocoa Brown", rgb: "#4f3836", l: 26.2746364783929, a: 9.53905346321743, b: 5.14987824208858},
//	{name: "Copper Trinar", rgb: "", l: 0, a: 0, b: 0}, // Invalid product code
	{name: "Evergreen", rgb: "#364e42", l: 31.2548311234148, a: -12.4624391963697, b: 4.41776638463374},
	{name: "Forest Green", rgb: "#154033", l: 23.6719651034171, a: -18.6422330262289, b: 3.5573026727422},
	{name: "Gallery Blue", rgb: "#20466c", l: 28.7992129155654, a: 0.444901918898399, b: -25.815337802195},
	{name: "Ivory", rgb: "#e8d0bc", l: 84.7985970031582, a: 4.50975255350933, b: 12.6296572068999},
	{name: "Light Gray", rgb: "#a7a1a7", l: 67.4354823779004, a: 2.59516237608687, b: -1.58901284873534},
	{name: "Light Stone", rgb: "#cbbcae", l: 77.1864439462667, a: 3.09283347052181, b: 8.61302538683979},
	{name: "Marine Green", rgb: "#639495", l: 58.0475244710623, a: -15.8707152189694, b: -5.89582940921558},
//	{name: "Patina Green", rgb: "", l: 0, a: 0, b: 0}, // Not approved
	{name: "Regal White", rgb: "#d1cace", l: 82.2940672950966, a: 3.35025603818828, b: -1.38484836592445},
	{name: "Royal Blue", rgb: "#4c6e88", l: 44.8582150028961, a: -5.49955760739423, b: -18.1587164835457},
	{name: "Sahara Tan", rgb: "#b6987e", l: 64.6770494170444, a: 7.03720846064265, b: 18.175612132069},
	{name: "Slate Gray", rgb: "#4e5058", l: 33.648111147696, a: 0.740709000902035, b: -5.23536593131083},
];

/*
 * Due to reflections on metal, shadows, sunlight, etc - the appearance of metal
 * may differ drastically from one picture to another. This is an attempt to, at
 * least to some degree, account for these differences.
 * 
 * I started by using around 40 pictures from the Reed's Metals Gallery. For
 * each of these pictures I sampled a few random pixels from the image and
 * compared the displayed color to the expected color.
 * 
 * I then looked for patterns in the differences between L, a, and b values.
 * This led me to discover two distinct classes of pictures that are fairly
 * easy to calculate the actual pixel from a given expected pixel (a roof in
 * the sun, or a wall in the sun). A third class existed for roofs and walls in
 * shadow, however these varied much more greatly based on how dark the shadow
 * was - making it nearly impossible to get an average that covered all use
 * cases. Although it's a poor estimate, I did average the effects of various
 * shadows to get a general idea of how metal behaves when photographed.
 * 
 * Finally, I passed through the exact expected values to get the "nonMetal".
 * 
 * When a pixel is clicked, I convert that pixel to four different values:
 *  - What color metal roof, in the sun, would create this pixel?
 *  - What color metal wall, in the sun, would create this pixel?
 *  - What color metal, in shadow, would create this pixel?
 *  - What color is this pixel?
 * 
 * I then perform color matching for all four of these values.
 */
var offsets = {
	roofSun: {
		l: {
			a: 0.0102,
			b: -0.1813,
			c: 1.8103
		},
		a: {
			// My training data for this value was insufficient, leading to a
			// regression that failed to extrapolate for red roofs well (I only
			// had red walls to work with in the training data)
			// To counter this, I used a linear regression instead of quadratic
			a: 0,
			b: 2.4278,
			c: -3.9246
		},
		b: {
			a: 0.0874,
			b: 0.2109,
			c: 3.0835
		}
	},
	wallSun: {
		l: {
			a: -0.0011,
			b: 0.8578,
			c: -4.5922
		},
		a: {
			a: -0.0033,
			b: 0.8433,
			c: -0.2491
		},
		b: {
			a: -0.0133,
			b: 1.3125,
			c: -3.5601
		}
	},
	overcast: {
		l: {
			a: -0.0092,
			b: 1.8712,
			c: -10.191
		},
		a: {
			a: -0.0042,
			b: 1.0785,
			c: 3.0227
		},
		b: {
			a: 0.0092,
			b: 0.8067,
			c: 0.6918
		}
	},
	// Pass through without modification
	nonMetal: {
		l: {
			a: 0,
			b: 1,
			c: 0
		},
		a: {
			a: 0,
			b: 1,
			c: 0
		},
		b: {
			a: 0,
			b: 1,
			c: 0
		}
	}
};

for (var x = 0; x < products.length; x++) {
	var productColor = document.createElement("div");
	productColor.innerHTML = "<p>" + products[x].name + "</p>";
	document.getElementById("color-list").appendChild(productColor);
	productColor.style.backgroundColor = (products[x].rgb)
}

var fileInput = document.getElementById("fileInput");
var hiddenImg = document.getElementById("hiddenImg");
var displayImg = document.getElementById("displayImg");
var ctx = displayImg.getContext("2d");

var selectedColor = document.getElementsByClassName("selectedColor");
var closestMatchDiv = document.getElementById("closestMatchDiv");
var closestComplementDiv = document.getElementById("closestComplementDiv");

var average = false;
document.getElementById("average").addEventListener("change", function(e)
{
	disableMagnification(displayImg);
	average = e.target.checked;
	enableMagnification(displayImg, {
		radius: displayImg.clientWidth * 0.1,
		zoom: 8,
		selectSize: average ? 3 : 0
	});
});

function drawImage()
{
	disableMagnification(displayImg);

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
		zoom: 8,
		selectSize: average ? 3 : 0
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

function findClosest(labColor)
{
	var closestMatch = null;
	var minDistance = 9e9;
	for (var i = 0; i < products.length; i++)
	{
		var distance = (
			Math.pow(labColor.l - products[i].l, 2) +
			Math.pow(labColor.a - products[i].a, 2) +
			Math.pow(labColor.b - products[i].b, 2)
		);
		if (distance < minDistance)
		{
			minDistance = distance;
			closestMatch = products[i];
		}
	}
	return closestMatch;
}

// Handle click
function handleClick(e)
{
	var x = e.offsetX;
	var y = e.offsetY;

	// Grab color at mouse location
	var selected;
	if (average)
	{
		selected = [0, 0, 0];
		var count = 0;
		for (var i = x - 3; i <= x + 3; i++)
		{
			for (var j = y - 3; j <= y + 3; j++)
			{
				if (x > 0 && y > 0 && x < displayImg.width && y < displayImg.height)
				{
					var pixel = ctx.getImageData(i, j, 1, 1).data;
					selected[0] += pixel[0];
					selected[1] += pixel[1];
					selected[2] += pixel[2];
					count ++;
				}
			}
		}
		selected[0] = selected[0] / count;
		selected[1] = selected[1] / count;
		selected[2] = selected[2] / count;
	}
	else
	{
		selected = ctx.getImageData(x, y, 1, 1).data;
	}
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

	// Compute offsets and closest match
	var lab = {};
	var closest = {};
	for (var type in offsets)
	{
		lab[type] = {
			l: offsets[type].l.a * selected.l * selected.l + offsets[type].l.b * selected.l + offsets[type].l.c,
			a: offsets[type].a.a * selected.a * selected.a + offsets[type].a.b * selected.a + offsets[type].a.c,
			b: offsets[type].b.a * selected.b * selected.b + offsets[type].b.b * selected.b + offsets[type].b.c
		};
		closest[type] = findClosest(lab[type]);
	}

	// Find the closest complement
	lab["complement"] = complement;
	closest["complement"] = findClosest(complement);

	// Output
	for (var type in closest)
	{
		var rgb = labToRgb(lab[type]);
		var selectedDiv = document.getElementById(type + "Selected");
		if (selectedDiv)
		{
			selectedDiv.style.backgroundColor = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
		}
		var matchDiv = document.getElementById(type + "MatchDiv");
		if (matchDiv)
		{
			matchDiv.style.backgroundColor = closest[type].rgb;
			matchDiv.classList.add("noLeftBorder");
		}
		var nameDiv = document.getElementById(type + "Name");
		if (nameDiv)
		{
			nameDiv.innerText = closest[type].name;
		}
	}
}
displayImg.addEventListener("click", handleClick);
displayImg.addEventListener("touchend", handleClick);

window.addEventListener("load", function()
{
	displayImg.height = displayImg.clientHeight;
	displayImg.width = displayImg.clientWidth;
	hiddenImg.src="reedsMetals.jpg";
});

window.addEventListener("resize", function()
{
	displayImg.height = displayImg.clientHeight;
	displayImg.width = displayImg.clientWidth;
	drawImage();
});
