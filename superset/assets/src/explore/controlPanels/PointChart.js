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
import { t } from '@superset-ui/translation';

export default {
  controlPanelSections: [
    {
      label: t('NOT GROUPED BY'),
      description: t('Use this section if you want to query atomic rows'),
      expanded: true,
      controlSetRows: [
        ['all_columns_x'],
        ['all_columns_y'],
        ['row_limit', null],
      ],
    },
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['show_markers'],
        ['treemap_ratio'],
        ['fill_color_picker'],
        ['stroke_color_picker'],
        ['color_picker'],
        ['target_color_picker'],
      ],
    },
  ],
  controlOverrides: {
    show_markers: {
      label: t('Show Annotation Line'),
      default: true,
      description: t('Show annotation line on x-axis at given Annotation Line Value'),
    },
    treemap_ratio: {
      label: t('Annotation Line Value'),
      default: 1,
      isInt: true,
      description: t('Set annotation line value'),
    },
    fill_color_picker: {
      label: t('Annotation Line Color'),
      default: { r: 0, g: 0, b: 0, a: 1 },
      description: t('Set Annotation Line Color'),
    },
    stroke_color_picker: {
      label: t('Axis Color'),
      default: { r: 0, g: 0, b: 0, a: 1 },
      description: t('Set Axis Color'),
    },
    color_picker: {
      label: t('Axis Label Color'),
      default: { r: 0, g: 0, b: 0, a: 1 },
      description: t('Set Axis Label Color'),
    },
    target_color_picker: {
      label: t('Point Fill Color'),
      default: { r: 255, g: 0, b: 0, a: 1 },
      description: t('Set Point Fill Color'),
    },
  },
};
