/*
 * magnifier.js
 * Author: Steven Barnett
 * 
 * This script is pretty simple. Given a canvas object (it must be a canvas,
 * there was no support added for images or videos or anything yet) this will
 * add a listener to mousemove and touch to display a zoomed-in version of the
 * image. Useful when trying to select individual pixels.
 * 
 * Two functions exist:
 *     enableMagnification(canvas[, opts]) -- binds the event listeners
 *     disableMagnification(canvas) -- unbinds the events listeners
 * 
 * "opts" is an optional JavaScript object for configuring the look. Options
 * include:
 *     radius - the radius of the magnifier circle
 *     offset - how far from the mouse the edge of the magnifier circle will be
 *     zoom - the zoom level
 * 
 * Example:
 *     enableMagnification(canvas, {zoom: 2});
 */

var activeMagnifiers = {};

function clearImage(e)
{
	var ctx = activeMagnifiers[id].context;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawOriginal(e)
{
	var ctx = activeMagnifiers[id].context;
	ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, canvas.width, canvas.height);
}

function drawMagnifier(e)
{
	var canvas = e.target;
	var m = activeMagnifiers[canvas];
	var ctx = m.context;

	// Get the exact X and Y coordinates that were clicked
	var x = e.offsetX;
	var y = e.offsetY;

	// Display the magnifier
	m.magnifier.style.display = "block";
	m.magnifier.style.top = e.pageY;
	m.magnifier.style.left = e.pageX;

	// Clear the magnifier
	ctx.clearRect(0, 0, m.magnifier.width, m.magnifier.height);

	// Draw the circle (at the appropriate offset)
	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.arc(m.center, m.center, m.options.radius, 0, 2 * Math.PI, false);
	ctx.fill();

	// Restrict future drawing to within the circle
	ctx.save();
	ctx.clip();

	// Draw the zoomed area
	//ctx.translate(-(m.options.zoom - 1) * (x - m.options.offset), -(m.options.zoom - 1) * (y - m.options.offset));
	//ctx.scale(m.options.zoom, m.options.zoom);
	var zoomArea = m.options.radius;
	var imgArea = m.options.radius / m.options.zoom;
	ctx.drawImage(
		m.snapshot,
		x - imgArea, y - imgArea, 2 * imgArea, 2 * imgArea,
		m.center - zoomArea, m.center - zoomArea, 2 * zoomArea, 2 * zoomArea
	);

	// Draw a grid over the pixels
	for (var i = 0; i < m.magnifier.width; i += m.options.zoom)
	{
		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, m.magnifier.height);
		ctx.stroke();
	}
	for (var j = 0; j < m.magnifier.height; j += m.options.zoom)
	{
		ctx.beginPath();
		ctx.moveTo(0, j);
		ctx.lineTo(m.magnifier.width, j);
		ctx.stroke();
	}

	// Make the selected pixel red
	// First, find the exact start and end of said pixels
	var centerStart = Math.floor(m.center / m.options.zoom) * m.options.zoom;
	ctx.save();
	ctx.strokeStyle = "red";
	ctx.rect(centerStart, centerStart, m.options.zoom, m.options.zoom);
	ctx.stroke();
	ctx.restore();

	// Remove the clipping
	ctx.restore();
}

function restoreImage(e)
{
	var canvas = e.target;
	var m = activeMagnifiers[canvas];
	
	// Easy mode:
	m.magnifier.style.display = "none";
}

function enableMagnification(canvas, opts)
{
	var defaults = {
		radius: 50,
		offset: 50,
		zoom: 4
	};
	var options = Object.assign({}, defaults, opts);

	// Calculate center of circle, based on offset
	var center = (options.offset + options.radius) / Math.sqrt(2);

	// Take a snapshot
	var snapshot = document.createElement("img");
	snapshot.src = canvas.toDataURL();

	// Configure the magnifier styles
	var magnifier = document.createElement("canvas");
	magnifier.style.position = "absolute";
	magnifier.style.display = "none";
	magnifier.width = center + options.radius;
	magnifier.style.width = center + options.radius;
	magnifier.height = center + options.radius;
	magnifier.style.height = center + options.radius;
	magnifier.style.pointerEvents = "none";
	document.body.appendChild(magnifier);

	//Then add all event listeners
	canvas.addEventListener("touchmove", drawMagnifier);
	canvas.addEventListener("mousemove", drawMagnifier);
	canvas.addEventListener("touchend", restoreImage);
	canvas.addEventListener("mouseout", restoreImage);
	
	// Finally, add this canvas to our activeMagnifiers
	activeMagnifiers[canvas] = {
		canvas: canvas,
		snapshot: snapshot,
		magnifier: magnifier,
		context: magnifier.getContext("2d"),
		options: options,
		center: center
	};
}

function disableMagnification(canvas)
{
	// Remove all event listeners
	canvas.removeEventListener("touchmove", drawMagnifier);
	canvas.removeEventListener("mousemove", drawMagnifier);
	canvas.removeEventListener("touchend", restoreImage);
	canvas.removeEventListener("mouseout", restoreImage);

	// Delete the magnifier
	document.body.removeChild(activeMagnifiers[canvas].magnifier);

	// Then remove it from the activeMagnifiers
	delete activeMagnifiers[canvas];
}