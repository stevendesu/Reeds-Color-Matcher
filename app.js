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
	{name: "Charcoal Gray", rgb: "#565656", l: 36.5667013570487, a: 0.0023838545715193504, b: -0.004716585582842381}
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
