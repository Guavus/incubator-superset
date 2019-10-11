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
      label: t('Options'),
      expanded: true,
      controlSetRows: [
        ['show_markers'],
        ['treemap_ratio']
      ],
    },
  ],
  controlOverrides: {
    show_markers: {
      label: t('Show Annotation Line'),
      default: true,
      renderTrigger: false,
      description: t('Show annotation line on x-axis at given Annotation Line Value'),
    },
    treemap_ratio: {
      label: t('Annotation Line Value'),
      default: 1,
      renderTrigger: false,
      description: t('Set annotation line value'),
   },
  },
};
