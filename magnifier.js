function magnify(canvas) {
	var snapshot = document.createElement("img");
	var ctx = canvas.getContext("2d");

	function drawChart()
	{
		ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, canvas.width, canvas.height);
	}

	// On mouse-over, get a snapshot of the image
	// This is so that we can restore it on mouse-out
	// Also, after getting a snapshot, cover the image
	// in a light-gray "fog" for visual appeal
	canvas.addEventListener("mouseover", function(e)
	{
		snapshot.src = canvas.toDataURL();
	});

	// On mouse-out, restore the snapshot
	canvas.addEventListener("mouseout", function(e)
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawChart();
	});

	// Bind mousemove event
	canvas.addEventListener("mousemove", function(e)
	{
		var rect = displayImg.getBoundingClientRect();
		var x = e.clientX - rect.x;
		var y = e.clientY - rect.y;
		var radius = canvas.clientWidth * 0.1;
		var zoom = 8;

		// Restart the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawChart();
	
		// Push the current state, so we can return here
		ctx.save();

		// Draw a circle that will contain the zoomed image
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
		ctx.fill();

		// Restrict future drawing to our circle
		ctx.clip();

		// Draw the zoomed area
		ctx.save();
		ctx.translate(-(zoom - 1) * x, -(zoom - 1) * y);
		ctx.scale(zoom, zoom);
		drawChart();

		// Draw a shadow around the zoomed area
		ctx.beginPath();
		ctx.lineWidth = 24 / zoom;
		var color = ctx.getImageData(x, y, 1, 1).data;
		ctx.strokeStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
		ctx.arc(x, y, radius / zoom, 0, 2 * Math.PI, false);
		ctx.stroke();

		// Draw an inner circle to separate reticule from color ring
		ctx.beginPath();
		ctx.lineWidth = 2 / zoom;
		var color = ctx.getImageData(x, y, 1, 1).data;
		ctx.strokeStyle = "#000";
		ctx.arc(x, y, radius / zoom - (12 / zoom), 0, 2 * Math.PI, false);
		ctx.stroke();

		// Draw a final stroke
		ctx.beginPath();
		ctx.lineWidth = 4 / zoom;
		ctx.arc(x, y, radius / zoom, 0, 2 * Math.PI, false);
		ctx.stroke();

		// Draw a box around the pixel of interest
		ctx.beginPath();
		ctx.lineWidth = 2 / zoom;
		ctx.rect(x - 0.5, y - 0.5, 1, 1);
		ctx.stroke();

		// Draw reticule
		/*
		ctx.beginPath();
		ctx.moveTo(x - 10, y);
		ctx.lineTo(x - 1, y);
		ctx.moveTo(x, y - 10);
		ctx.lineTo(x, y - 1);
		ctx.moveTo(x + 10, y);
		ctx.lineTo(x + 1, y);
		ctx.moveTo(x, y + 10);
		ctx.lineTo(x, y + 1);
		ctx.stroke();
		*/

		ctx.restore();
		ctx.restore();
	});
}

magnify(document.getElementById("displayImg"));