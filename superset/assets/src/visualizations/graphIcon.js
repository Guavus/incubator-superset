/**
 * Created by rasmiranjan.nayak on 28/05/15.
 */

/*
 * L.ENB is a circle overlay with a permanent pixel radius.
 */
function drawHexagon(cntxt, x_1,y_1,y_2, options){
  cntxt.moveTo(0, 0);
  cntxt.lineTo(x_1, y_1);
  cntxt.lineTo(x_1, (y_2 - y_1));
  cntxt.lineTo(0, y_2);
  cntxt.lineTo(-(x_1), (y_2 - y_1));
  cntxt.lineTo(-(x_1), y_1);
  cntxt.lineTo(0, 0);

  cntxt.fill();
  cntxt.stroke();
  cntxt.closePath();

  cntxt.font = "10px";
  cntxt.fillStyle = "white";
  cntxt.textAlign = "center";
  cntxt.fillText(options.markerValue, 0, y_2/2);

}
function drawCenterArc(cntxt,x_1,y_1,y_2,inner_circle_radius) {
  cntxt.lineWidth = 1;
  cntxt.strokeStyle = '#19242A';
  cntxt.beginPath();
  cntxt.moveTo(0, y_2);
  cntxt.lineTo(-x_1, y_2 - y_1);
  cntxt.moveTo(0, y_2);
  cntxt.lineTo(x_1, y_2 - y_1);
  cntxt.stroke();

  cntxt.strokeStyle = 'black';
  cntxt.beginPath();
  cntxt.arc(0, y_2, inner_circle_radius, 7*Math.PI/6,  11*Math.PI/6);
  cntxt.stroke();
}
function drawRightArc(cntxt,x_1,y_1,y_2, inner_circle_radius){

  cntxt.lineWidth = 1;
  cntxt.strokeStyle = '#19242A';
  cntxt.beginPath();
  cntxt.moveTo(-x_1, y_1);
  cntxt.lineTo(0, 0);
  cntxt.moveTo(-x_1, y_1);
  cntxt.lineTo(-x_1, y_2-y_1);
  cntxt.stroke();

  cntxt.strokeStyle = 'black';
  cntxt.beginPath();
  cntxt.arc(-x_1, y_1, inner_circle_radius, 11*Math.PI/6, Math.PI/2);
  cntxt.stroke();
}

function drawLeftArc(cntxt,x_1,y_1,y_2,inner_circle_radius){
  cntxt.lineWidth = 1;
  cntxt.strokeStyle = '#19242A';
  cntxt.beginPath();
  cntxt.moveTo(x_1, y_1);
  cntxt.lineTo(0, 0);
  cntxt.moveTo(x_1, y_1);
  cntxt.lineTo(x_1, y_2-y_1);
  cntxt.stroke();

  cntxt.strokeStyle = 'black';
  cntxt.beginPath();
  cntxt.arc(x_1, y_1, inner_circle_radius, Math.PI/2, 7*Math.PI/6);
  cntxt.stroke();
}


export var ENB = L.Icon.extend({
  createIcon: function (oldIcon) {
    const div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div');
    const options = this.options;
    const canvas_height = 32;
    const canvas_width = 30;
    const offset = 10;
    var edge_length = 15;
    var inner_circle_radius = edge_length / 1.5;
    var theta = 30 * (Math.PI / 180);
    var x_1 = edge_length * (Math.cos(theta));
    var y_1 = edge_length * (Math.sin(theta));
    var y_2 = y_1 + (edge_length + (y_1));
    const translateCenterY = 0;
    const translateCenterX = canvas_width / 2;

    var grd ;

    div.id = 'mapEnode';
    div.innerHTML = '';

    const graphicsBox = L.DomUtil.create("canvas", "graphicsBox");
    graphicsBox.height = canvas_height;
    graphicsBox.width = canvas_width;

    const cntxt = graphicsBox.getContext("2d");
    cntxt.translate(translateCenterX, translateCenterY);

    if (options.directionValue >=0 && options.directionValue <=120) {
      grd = cntxt.createLinearGradient(0, y_1, x_1, y_2);
      grd.addColorStop(0, options.color);
      grd.addColorStop(1, 'transparent');

      cntxt.beginPath();
      cntxt.fillStyle = grd;
      cntxt.strokeStyle = grd;
      drawHexagon(cntxt,x_1,y_1,y_2,options);
      drawRightArc(cntxt, x_1, y_1,y_2,inner_circle_radius)
    }
    else if (options.directionValue > 120 && options.directionValue <= 240) {
      grd = cntxt.createLinearGradient(x_1, y_1, -x_1, y_2-y_1);
      grd.addColorStop(1, 'transparent' );
      grd.addColorStop(0, options.color);

      cntxt.beginPath();
      cntxt.fillStyle = grd;
      cntxt.strokeStyle = grd;
      drawHexagon(cntxt,x_1,y_1,y_2,options);
      drawLeftArc(cntxt, x_1, y_1,y_2,inner_circle_radius)
    }
    else if (options.directionValue > 240 && options.directionValue <= 360) {
      grd = cntxt.createLinearGradient(0, 0, 0, y_2 - offset * 1.5);
      grd.addColorStop(0, 'transparent' );
      grd.addColorStop(1, options.color);

      cntxt.beginPath();
      cntxt.fillStyle = grd;
      cntxt.strokeStyle = grd;
      drawHexagon(cntxt,x_1,y_1,y_2,options);
      drawCenterArc(cntxt, x_1, y_1,y_2,inner_circle_radius);
    }

    div.appendChild(graphicsBox);
    div.style.position = 'absolute';
    if (options.directionValue > 240 && options.directionValue <= 360) {
      div.style.top = -35 + 'px';
      div.style.left = -35 + 'px';
    } else if (options.directionValue > 120 && options.directionValue <= 240) {
      div.style.top = -12.5 + 'px';
      div.style.left = -47 + 'px';
    }else if(options.directionValue >=0 && options.directionValue <=120){
      div.style.top = -12.5 + 'px';
      div.style.left = -20 + 'px';
    }
    this._setIconStyles(div, 'icon');

    return div;
  }
});

L.enb = function (options) {
  return new L.ENB(options);
};
