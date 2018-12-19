/**
 * Created by rasmiranjan.nayak on 28/05/15.
 */

/*
 * L.ENB is a circle overlay with a permanent pixel radius.
 */

function createCenterNode(grd,cntxt, edge_length, offset, options,x_1,y_1,y_2,inner_circle_radius) {
  // - Edge 1 for Enode (center)
  grd.addColorStop(0, options.colorY);
  grd.addColorStop(1, options.colorX);

  cntxt.beginPath();
  cntxt.fillStyle = grd;
  cntxt.strokeStyle = grd;

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

  cntxt.strokeStyle = 'black';
  cntxt.beginPath();
  cntxt.arc(0, y_2, inner_circle_radius, 7*Math.PI/6,  11*Math.PI/6);
  cntxt.stroke();

  cntxt.lineWidth = 1;
  cntxt.strokeStyle = '#19242A';
  cntxt.beginPath();
  cntxt.moveTo(0, y_2);
  cntxt.lineTo(-x_1, y_2 - y_1);
  cntxt.moveTo(0, y_2);
  cntxt.lineTo(x_1, y_2 - y_1);
  cntxt.stroke();

  /* cntxt.font = "10px Arial";
  cntxt.fillText(options.directionValue, 0, 5); */

}

function createRightNode(grd,cntxt,edge_length, offset, options,x_1,y_1,y_2, inner_circle_radius){
    grd.addColorStop(0, options.colorX1);
    grd.addColorStop(1, options.colorY1);

    cntxt.beginPath();
    cntxt.fillStyle = grd;
    cntxt.strokeStyle = grd;

    cntxt.moveTo(0, y_2);
    cntxt.lineTo(0, y_2 + edge_length);
    cntxt.lineTo(x_1, (y_2 + edge_length + y_1));
    cntxt.lineTo(x_1 * 2, y_2 + edge_length);
    cntxt.lineTo(x_1 * 2, y_2);
    cntxt.lineTo(x_1, (edge_length + y_1));

    cntxt.fill();
    cntxt.stroke();
    cntxt.closePath();

    cntxt.lineWidth = 1;
    cntxt.strokeStyle = '#19242A';
    cntxt.beginPath();
    cntxt.moveTo(0, y_2);
    cntxt.lineTo(0, y_2 + edge_length);
    cntxt.moveTo(0, y_2);
    cntxt.lineTo(x_1, y_2 - y_1);
    cntxt.stroke();

    cntxt.strokeStyle = 'black';
    cntxt.beginPath();
    cntxt.arc(0, y_2, inner_circle_radius, 11*Math.PI/6, Math.PI/2);
    cntxt.stroke();

    /* cntxt.font = "10px Arial";
    cntxt.fillStyle = 'white';
    cntxt.textAlign = "center";
    cntxt.fillText(options.directionValue, 0, 5); */
}

function createLeftNode(grd,cntxt, edge_length, offset, options,x_1,y_1,y_2,inner_circle_radius){
  grd.addColorStop(0, options.colorX2);
  grd.addColorStop(1, options.colorY2);

  cntxt.beginPath();
  cntxt.fillStyle = grd;
  cntxt.strokeStyle = grd;

  cntxt.moveTo(0, y_2 + edge_length);
  cntxt.lineTo(-x_1, (y_2 + edge_length + y_1));
  cntxt.lineTo(-x_1 * 2, y_2 + edge_length);
  cntxt.lineTo(-x_1 * 2, y_2);
  cntxt.lineTo(-x_1, y_2 - y_1);
  cntxt.lineTo(-x_1 + x_1, (y_2 - y_1) + y_1);

  cntxt.fill();
  cntxt.stroke();
  cntxt.closePath();

  cntxt.lineWidth = 1;
  cntxt.strokeStyle = '#19242A';
  cntxt.beginPath();
  cntxt.moveTo(0, y_2);
  cntxt.lineTo(0, y_2 + edge_length);
  cntxt.moveTo(0, y_2);
  cntxt.lineTo(-x_1, y_2 - y_1);
  cntxt.stroke();

  cntxt.strokeStyle = 'black';
  cntxt.beginPath();
  cntxt.arc(0, y_2, inner_circle_radius, Math.PI/2, 7*Math.PI/6);
  cntxt.stroke();

  /* cntxt.font = "10px Arial";
  cntxt.fillText(options.directionValue, 0, 5); */
}

export var ENB = L.Icon.extend({
  options: {
    id: '',
    color: 'red',
    colorX: '#87BC24',
    colorY: 'transparent',
    colorX1: '#ff0000',
    colorY1: 'transparent',
    colorX2: '#F4A90A',
    colorY2: 'transparent',
    className: 'leaflet-div-icon',
    name: '',
    highlight: false,
    enableGlow: false
  },

  createIcon: function (oldIcon) {
    const div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div');
    const options = this.options;
    const canvas_height = 70;
    const canvas_width = 70;
    const offset = 10;
    const translateCenterY = 5;
    const translateCenterX = canvas_width / 2;

    var edge_length = 15;
    var inner_circle_radius = edge_length / 1.5;

    div.id = 'mapEnode';
    div.innerHTML = '';

    const graphicsBox = L.DomUtil.create("canvas", "graphicsBox");
    graphicsBox.height = canvas_height;
    graphicsBox.width = canvas_width;
    const cntxt = graphicsBox.getContext("2d");
    cntxt.translate(translateCenterX, translateCenterY);

    if (options.enableGlow) {
      cntxt.shadowBlur = 20;
      cntxt.shadowColor = 'blue';
    } else {
      cntxt.shadowColor = 'transparent';
    }

    var theta = 30 * (Math.PI / 180);
    var x_1 = edge_length * (Math.cos(theta));
    var y_1 = edge_length * (Math.sin(theta));
    var y_2 = y_1 + (edge_length + (y_1));
    let grd ;
    if (options.directionValue >=0 && options.directionValue <=120) {
      grd = cntxt.createLinearGradient(offset * 1.4, y_2 + offset * 1.2, (x_1 + offset) * 1.6, y_2 + edge_length + offset);
      createRightNode(grd,cntxt, edge_length,offset, options, x_1, y_1,y_2,inner_circle_radius)
    }
    else if (options.directionValue > 120 && options.directionValue <= 240) {
      grd = cntxt.createLinearGradient(-offset * 1.5, y_2 + offset, ((-x_1 - 3) * 2), (y_2 + edge_length + 3));
      createLeftNode(grd,cntxt, edge_length,offset, options, x_1, y_1,y_2,inner_circle_radius)
    }
    else if (options.directionValue > 240 && options.directionValue <= 360) {
      grd = cntxt.createLinearGradient(0, 0, 0, (y_1 + (edge_length + y_1)) - offset * 1.8);
      createCenterNode(grd,cntxt, edge_length,offset, options, x_1, y_1,y_2,inner_circle_radius);
    }

    /* cntxt.moveTo(0, y_2);
    cntxt.lineTo(0, (y_2 + edge_length)); */


    div.appendChild(graphicsBox);
    div.style.position = 'absolute';
    div.style.top = -35 + 'px';
    div.style.left = -35 + 'px';
    //  div.style.backgroundColor = 'yellow';

    this._setIconStyles(div, 'icon');

    return div;
  }
});

L.enb = function (options) {
  return new L.ENB(options);
};
