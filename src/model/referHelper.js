/**
 * Helper for model references.
 * There are many manners to refer axis/coordSys.
 */

// TODO
// merge relevant logic to this file?
// check: "modelHelper" of tooltip and "BrushTargetManager".

import {__DEV__} from '../config';
import {createHashMap, retrieve} from 'zrender/src/core/util';

/**
 * @return {Object} For example:
 * {
 *     coordSysName: 'cartesian2d',
 *     coordSysDims: ['x', 'y', ...],
 *     axisMap: HashMap({
 *         x: xAxisModel,
 *         y: yAxisModel
 *     }),
 *     categoryAxisMap: HashMap({
 *         x: xAxisModel,
 *         y: undefined
 *     }),
 *     // It also indicate that whether there is category axis.
 *     firstCategoryDimIndex: 1,
 * }
 */
export function getCoordSysDefineBySeries(seriesModel) {
    var coordSysName = seriesModel.get('coordinateSystem');
    var result = {
        coordSysName: coordSysName,
        coordSysDims: [],
        axisMap: createHashMap(),
        categoryAxisMap: createHashMap()
    };
    var fetch = fetchers[coordSysName];
    if (fetch) {
        fetch(seriesModel, result, result.axisMap, result.categoryAxisMap);
        return result;
    }
}

var fetchers = {

    cartesian2d: function (seriesModel, result, axisMap, categoryAxisMap) {
        var xAxisModel = seriesModel.getReferringComponents('xAxis')[0];
        var yAxisModel = seriesModel.getReferringComponents('yAxis')[0];

        if (__DEV__) {
            if (!xAxisModel) {
                throw new Error('xAxis "' + retrieve(
                    seriesModel.get('xAxisIndex'),
                    seriesModel.get('xAxisId'),
                    0
                ) + '" not found');
            }
            if (!yAxisModel) {
                throw new Error('yAxis "' + retrieve(
                    seriesModel.get('xAxisIndex'),
                    seriesModel.get('yAxisId'),
                    0
                ) + '" not found');
            }
        }

        result.coordSysDims = ['x', 'y'];
        axisMap.set('x', xAxisModel);
        axisMap.set('y', yAxisModel);

        if (isCategory(xAxisModel)) {
            categoryAxisMap.set('x', xAxisModel);
            result.firstCategoryDimIndex = 0;
        }
        if (isCategory(yAxisModel)) {
            categoryAxisMap.set('y', yAxisModel);
            result.firstCategoryDimIndex = 1;
        }
    },

    singleAxis: function (seriesModel, result, axisMap, categoryAxisMap) {
        var singleAxisModel = seriesModel.getReferringComponents('singleAxis')[0];

        if (__DEV__) {
            if (!singleAxisModel) {
                throw new Error('singleAxis should be specified.');
            }
        }

        result.coordSysDims = ['single'];
        axisMap.set('single', singleAxisModel);

        if (isCategory(singleAxisModel)) {
            categoryAxisMap.set('single', singleAxisModel);
            result.firstCategoryDimIndex = 0;
        }
    },

    polar: function (seriesModel, result, axisMap, categoryAxisMap) {
        var polarModel = seriesModel.getReferringComponents('polar')[0];
        var radiusAxisModel = polarModel.findAxisModel('radiusAxis');
        var angleAxisModel = polarModel.findAxisModel('angleAxis');

        if (__DEV__) {
            if (!angleAxisModel) {
                throw new Error('angleAxis option not found');
            }
            if (!radiusAxisModel) {
                throw new Error('radiusAxis option not found');
            }
        }

        result.coordSysDims = ['radius', 'angle'];
        axisMap.set('radius', radiusAxisModel);
        axisMap.set('angle', angleAxisModel);

        if (isCategory(radiusAxisModel)) {
            categoryAxisMap.set('radius', radiusAxisModel);
            result.firstCategoryDimIndex = 0;
        }
        if (isCategory(angleAxisModel)) {
            categoryAxisMap.set('angle', angleAxisModel);
            result.firstCategoryDimIndex = 1;
        }
    },

    geo: function (seriesModel, result, axisMap, categoryAxisMap) {
        result.coordSysDims = ['lng', 'lat'];
    }
};

function isCategory(axisModel) {
    return axisModel.get('type') === 'category';
}

