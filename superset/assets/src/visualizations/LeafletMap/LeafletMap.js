/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import './LeafletMap.css';
// todo: use types to avoid full path of libs
import '../../../node_modules/leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import * as L from '../../../node_modules/leaflet/dist/leaflet.js';
import * as esri from '../../../node_modules/esri-leaflet/dist/esri-leaflet.js';
import * as GRAPHICON from './graphIcon.js';
import PropTypes from 'prop-types';

const propTypes = {
    payload: PropTypes.object,
    formData: PropTypes.object,
    height: PropTypes.number,
    onAddFilter: PropTypes.func,
  };

function NOOP() {}

/**
 * Leaflet Map Visualization
 * @param {*} element
 * @param {*} props
 */
function LeafletMap(element, props) {

    const {height, payload, formData ,onAddFilter = NOOP } = props;

    const POLYGON = 'Polygon';
    const CONVEX = 'Convex';
    const CONCAVE = 'Concave';
    const POINT = 'Point';
    const MARKER_RADIUS = 10;
    const MARKER_WEIGHT = 1;
    const MARKER_OPACITY = 1;
    var colorCols;
    var geoJson;
    var mapInstance;
    var mapLayerType;
    var selectedColorColumn;
    var geoJsonLayer;
    var tooltipColumns = formData.allColumnsX;
    var enableClick = formData.chartInteractivity;
    var showTooltip = formData.richTooltip;
    var useEsriJS = formData.labelsOutside;

    function getMapId() {
      return 'leaflet-map' + props.formData.sliceId;
    }

    function getMapContainer() {
      return '<div id = ' + getMapId() + ' style="width: 100%; height: 100%;z-index:0;"></div>';
    }

    function getDefaultPolygonStyles() {
        return {
            color: getRgbColor(formData.strokeColorPicker),
            weight: MARKER_WEIGHT,
            opacity: MARKER_OPACITY,
            fillOpacity: formData.cellSize
        }
    }

    function getRgbColor(rgbObj) {
        return "rgb(" + rgbObj.r + "," + rgbObj.g + "," + rgbObj.b + "," + rgbObj.a + ")";
    }

    function setMapLayerType() {
        var map_style = formData.mapboxStyle;
        var types = map_style.split('-');
        mapLayerType = (types.length == 2) ? types[1] : types[0];
    }

    function setLayout() {
        // set innerHtML to hold map vis
        element.innerHTML = getMapContainer();
        element.style.height =  height;
        element.style.overflow =  'auto';
    }

    function createColorColumns() {
        // todo: current object is AdhocFilter,so propertynames are not match as we need
        // create AdhocColumn with correct names
        colorCols = {}
        if (formData.adhocColumns && formData.adhocColumns.length > 0) {
            formData.adhocColumns.forEach(element => {
                colorCols[element['subject']] = element;
            });
        }

        selectedColorColumn = Object.keys(colorCols)[0];

    }

    function getTurfBasedGeoCordinates(points, type) {
        var turfPoints = [];
        points.forEach(element => {
            turfPoints.push(turf.point(element))
        });
        var turfFeatureCollection = turf.featureCollection(turfPoints);
        var hullFeature;
        if (type == CONVEX)
            hullFeature = turf.convex(turfFeatureCollection);
        else if (type == CONCAVE)
            hullFeature = turf.concave(turfFeatureCollection);

        return hullFeature ? hullFeature.geometry.coordinates : points;
    }

    function getMapCordinates(data) {
        const geoJsonField = formData.polygon;
        var points = JSON.parse(data[geoJsonField]);
        if (mapLayerType == POINT) {
            return (points.length > 0 && points[0] instanceof Array) ? points[0] : points;
        }
        else if (mapLayerType == CONVEX || mapLayerType == CONCAVE) {
            return getTurfBasedGeoCordinates(points, mapLayerType)
        } else {
            return [points];
        }
    }

    function getRangeValue(val, max, min) {
      val = val < min ? min : (val > max ? max : val);
      if(max - min === 0) {
        return 1;
      }
      return (val - min) / (max - min);
    }

    function colourGradientor(lowValueColor,highValueColor,p,max,min){
        var rangeValue = getRangeValue(p,parseInt(max),parseInt(min));
        var rgb = {}
        rgb.r = parseInt((highValueColor.r - lowValueColor.r) * rangeValue + lowValueColor.r)
        rgb.g = parseInt((highValueColor.g - lowValueColor.g) * rangeValue + lowValueColor.g)
        rgb.b = parseInt((highValueColor.b - lowValueColor.b) * rangeValue + lowValueColor.b)
        rgb.a = parseInt((highValueColor.a - lowValueColor.a) * rangeValue + lowValueColor.a)
        return 'rgb('+rgb.r +',' + rgb.g +',' +rgb.b +','+rgb.a + ')';
    }

    function getColorForColumnVaule(colname, colvalue) {
        // todo: current object is AdhocFilter,so propertynames are not match as we need
        // create AdhocColumn with correct names
        var col = colorCols[colname];
        var minValue = col['operator'];
        var maxvalue = col['sqlExpression'];
        var minValueClr = col['comparator'];
        var maxValueClr = col['clause'];

        // todo: add algo to decrease /increase color intensity ad per value
        var colclr = colourGradientor(minValueClr, maxValueClr, colvalue,maxvalue,minValue);
        return colclr;
    }

    function getColumn(colname, colvalue) {
        return {
            'name': colname,
            'value': colvalue,
            'color': getColorForColumnVaule(colname, colvalue)
        }
    }

    function getMapProperties(data) {
        // create obj with all data
        var obj = Object.assign({}, data);
        obj['colorColumns'] = {}
        for (const key in data) {
            if (data.hasOwnProperty(key) && colorCols.hasOwnProperty(key)) {
                obj['colorColumns'][key] = getColumn(key, data[key])
            }
        }

        if (showTooltip) {
            obj.tooltip = getPopupContent(data)
        }
        if(formData.hasOwnProperty('allColumnsY') && formData.allColumnsY){
          obj.direction = data[formData.allColumnsY];
        }

        if(formData.hasOwnProperty('latitude') && formData.latitude){
          obj.markerValue = data[formData.latitude];
        }
        return obj;
    }

    function getMapGeometry(data) {

        return {
            'type': (mapLayerType == POINT) ? POINT : POLYGON,
            'coordinates': getMapCordinates(data)
        };
    }

    function getFeatureObject(data) {
        return {
            'type': 'Feature',
            'properties': getMapProperties(data),
            'geometry': getMapGeometry(data)
        }
    }

    function getFeatures() {
        var _data = payload.data.data;
        var feats = [];
        _data.forEach(element => {
            feats.push(getFeatureObject(element));
        });

        return feats;
    }

    function createMapDP() {
        geoJson = {
            'type': 'FeatureCollection',
            'features': getFeatures(),
        }
        console.log(geoJson);
    }

    function renderBasicMap() {

        const def_lat = formData.viewportLatitude;
        const def_long = formData.viewportLongitude;
        const def_zoom = formData.viewportZoom;
        const def_mapserver = formData.ranges;
        const min_zoom = formData.minRadius;
        const max_zoom = formData.maxRadius;

        mapInstance = L.map(getMapId(), {
            minZoom: min_zoom,
            maxZoom: max_zoom
        }).setView([def_lat, def_long], def_zoom, {});

        if (useEsriJS) {
            // todo:add auth token support if nay required
            // handle error/show notification if wrong server pass
            esri.tiledMapLayer({
                url: def_mapserver,
                minZoom: min_zoom,
                maxZoom: max_zoom
            }).addTo(mapInstance);
        } else {
            L.tileLayer(def_mapserver, {}).addTo(mapInstance);
        }
    }

    function getSelection(event, property, cssClass){
      var selection;
      // remove previous selected layers except selected
      Object.values(event.target._map._targets).forEach(element => {
        if (element.hasOwnProperty(property) && element[property].classList.contains(cssClass)
          && event.target._leaflet_id != element._leaflet_id) {
            element[property].classList.remove(cssClass);
        }
      });
      if (event.target[property].classList.contains(cssClass)) {
        event.target[property].classList.remove(cssClass);
      } else {
        event.target[property].classList.add(cssClass);
        selection = event.target.feature.properties;
      }
      return selection;
    }

    function mapItemClick(event) {
      if (enableClick) {
          var selection;
          if(event.target.hasOwnProperty('_path')){
            selection = getSelection(event, '_path', 'active-layer')
          } else if(event.target.hasOwnProperty('_icon')){
            selection = getSelection(event, '_icon', 'active-layer-canvas');
          }

          // publish all values as per publishColumns and its availability in selection
          formData.publishColumns.forEach((col, i, arr) => {
              let refresh = false;
              if (i === arr.length - 1) {
                  refresh = true;
              }
              if (selection && selection.hasOwnProperty(col)) {
                  onAddFilter(col, [selection[col]], false, refresh);
              } else {
                  // remove selections
                  onAddFilter(col, [], false, refresh);
              }
          });
      }
    }

    function getSelectedColorColumn() {
        return selectedColorColumn;
    }

    function getLayerStyles(feature) {
        var clr = feature.properties['colorColumns'][getSelectedColorColumn()].color;
        var styles = Object.assign({}, getDefaultPolygonStyles());
        styles.fillColor = clr;
        return styles;
    }

    function getPopupContent(data) {
        let tooltip = "<div style='display:grid'>"
        for (let index = 0; index < tooltipColumns.length; index++) {
            const columnName = tooltipColumns[index];
            tooltip += "<span>";
            tooltip += "<b class='leaflet-tooltip-title'>" + columnName + "</b> : " + data[columnName];
            tooltip += "</span>";
        }
        tooltip += "</div>";
        return tooltip;
    }

    function renderPolygonLayer() {
        geoJsonLayer = L.geoJson(geoJson, {
            style: function (feature) {
                return getLayerStyles(feature);
            },

            onEachFeature: function onEachFeature(feature, layer) {
                layer.on({
                    click: mapItemClick
                });
                if (showTooltip) {
                    var layerPopup;
                    layer.on('mouseover', function (e) {
                        var coordinates = e.latlng;
                        var latlngArr = [coordinates.lat, coordinates.lng];
                        if (mapInstance) {
                            layerPopup = L.popup()
                                .setLatLng(latlngArr)
                                .setContent(e.target.feature.properties.tooltip)
                                .openOn(mapInstance);
                        }
                    });
                    layer.on('mouseout', function (e) {
                        if (layerPopup && mapInstance) {
                            mapInstance.closePopup(layerPopup);
                            layerPopup = null;
                        }
                    });
                }
            },
            pointToLayer: function (feature, latlng) {
              var styles = getLayerStyles(feature)
              styles.radius = MARKER_RADIUS;
              var node;
              if(feature.properties.hasOwnProperty('direction')){
                var myIcon = new GRAPHICON.ENB({
                  color: feature.properties['colorColumns'][getSelectedColorColumn()].color,
                  directionValue: feature.properties.direction,
                  markerValue: feature.properties.markerValue,
                  className: 'my-div-icon',
                });
                node = L.marker(latlng, { icon: myIcon }).on('click', mapItemClick);
              } else {
                node = L.circleMarker(latlng, styles).on('click', mapItemClick);
              }
              return node;
            },
        }).addTo(mapInstance);
    }

    function changeColumn(event) {
        selectedColorColumn = event.target.value;
        mapInstance.removeLayer(geoJsonLayer);
        console.log(selectedColorColumn);
        renderPolygonLayer();
    }
    function getColumnOptions() {
        var str = "<select>";
        for (const key in colorCols) {
            if (colorCols.hasOwnProperty(key)) {
                str += "<option>" + key + "</option>";
            }
        }
        str += "</select>";
        return str;
    }

    function addColumnsDropdownToMap() {

        if (Object.keys(colorCols).length > 1) {
            var legend = L.control({ position: 'topright' });
            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'color_column_div');
                div.innerHTML = getColumnOptions();
                div.firstChild.onchange = changeColumn;
                return div;
            };
            legend.addTo(mapInstance);
        }
    }

    function drawMap() {
        renderBasicMap();
        renderPolygonLayer();
        addColumnsDropdownToMap();
    }

    function init() {

        setLayout();
        setMapLayerType();
        createColorColumns();
        createMapDP();
        drawMap();
    }

    init();
}

LeafletMap.displayName = 'Leaflet Map';
LeafletMap.propTypes = propTypes;
export default LeafletMap;
