<template>
    <div class="bike-fitting-calculator">
        <el-form :model="form" label-width="150px" @submit.native.prevent>
            <el-form-item label="身高 (cm)">
                <el-input v-model.number="form.height"></el-input>
            </el-form-item>
            <el-form-item label="跨高 (cm)">
                <el-input v-model.number="form.inseamHeight"></el-input>
            </el-form-item>
            <el-form-item label="躯干长度 (cm)">
                <el-input v-model.number="form.torsoLength"></el-input>
            </el-form-item>
            <el-form-item label="臂长 (cm)">
                <el-input v-model.number="form.armLength"></el-input>
            </el-form-item>
            <el-form-item label="肩宽 (cm)">
                <el-input v-model.number="form.shoulderWidth"></el-input>
            </el-form-item>
            <el-form-item label="柔韧性评分 (1-5)">
                <el-input-number v-model="form.flexibilityScore" :min="1" :max="5"></el-input-number>
            </el-form-item>
            <el-form-item label="核心力量评分 (1-5)">
                <el-input-number v-model="form.coreStrengthScore" :min="1" :max="5"></el-input-number>
            </el-form-item>
            <el-form-item label="骑行偏好">
                <el-select v-model="form.ridingPreference" placeholder="请选择">
                    <el-option label="舒适骑行" value="comfort"></el-option>
                    <el-option label="中立骑行" value="neutral"></el-option>
                    <el-option label="进取骑行" value="aggressive"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="calculateFitting">计算</el-button>
                <el-button type="success" @click="saveToLocalStorage">保存数据</el-button>
                <el-button type="warning" @click="generatePDF">下载PDF</el-button>
            </el-form-item>
        </el-form>

        <div v-if="calculated">
            <el-card>
                <p>座垫高度: {{ fittingResults.seatHeight }} mm</p>
                <p>座垫后移量: {{ fittingResults.saddleSetback }} mm</p>
<!--                <p>Stack Plus: {{ fittingResults.stackPlus }} mm</p>-->
<!--                <p>Reach Plus: {{ fittingResults.reachPlus }} mm</p>-->
                <p>推荐车架 Reach: {{ fittingResults.frameReach }} mm</p>
                <p>推荐车架 Stack: {{ fittingResults.frameStack }} mm</p>
            </el-card>
        </div>
    </div>
</template>

<script>
/* eslint-disable no-mixed-spaces-and-tabs */
import jsPDF from 'jspdf';
import 'jspdf-autotable';
export default {
    data() {
        return {
            form: {
                height: 185,
                inseamHeight: 87,
                torsoLength: 65,
                armLength: 66,
                shoulderWidth: 40,
                flexibilityScore: 1,
                coreStrengthScore: 1,
                ridingPreference: 'neutral',
            },
            calculated: false,
            fittingResults: {},
        };
    },
    mounted() {
        // this.loadFromLocalStorage();
    },
    methods: {
		calculateFitting() {
			// eslint-disable-next-line no-debugger
			debugger;
		    const { inseamHeight, torsoLength, armLength, height, ridingPreference } = this.form;
		    // 姿势参数定义
		    const stanceParams = {
		        comfort: { angle: 17, param: 0.52 },
		        neutral: { angle: 0, param: 0.535 },
		        aggressive: { angle: -17, param: 0.545 },
		    };
		    // 获取用户选择的骑姿参数
		    const stanceParam = stanceParams[ridingPreference];
		    const stemAngle = stanceParam.angle;
		    // 根据用户身高查询调整后的推荐落差参数
		    const dropRanges = this.getAdjustedDropRange(height, ridingPreference);
		    // 计算座垫高度
		    // 由于seatHeight是cm为单位，所以需要乘以10转换为mm
		    const seatHeight = (inseamHeight * 0.883 * 10).toFixed(2);
		    // 改进后的 Stack Plus 和 Reach Plus 计算 (转换为mm)
		    const stackPlus = ((seatHeight * 0.96 - dropRanges)).toFixed(2);
		    const reachPlus = (((torsoLength + armLength) * 10 * stanceParam.param - (seatHeight * 0.29) + 100)).toFixed(2);
		    // 计算车架 Stack 和 Reach
		    const handlebarValues = {
		        '-17': { stack: 48, reach: 205 },
		        '-7': { stack: 67, reach: 204 },
		        '0': { stack: 80, reach: 201 },
		        '7': { stack: 93, reach: 196 },
		        '17': { stack: 109, reach: 187 },
		    };
			// 在实际的自行车骑行运动中，弯把的长度是随着骑行者的身高进行默认调整的，比如165cm身高的骑行者，弯把的长度通常是80mm，而185cm身高的骑行者，弯把的长度是110mm
			// 当前的handlebarValues是基于把立长度110mm的情况下计算的，所以我们需要设计一个函数，这个函数可以计算得到一个系数，用于后续handlebarStack 和 handlebarReach的计算
			// 这个系数在185cm身高的骑行者下，应该是1，而在165cm身高的骑行者下，应该是0.72，这里就需要一个线性函数来计算这个系数
			const handlebarHeightParams = this.calculateHandlebarCoefficient(height);
			// 最后加上一个0.8的系数，是为了考虑到当前的handlebarValues是基于把立长度110mm的情况下计算的，而实际上我们的初始把立长度大多数情况下使用90更合适
		    const handlebarStack = handlebarValues[stemAngle].stack;
		    const handlebarReach = handlebarValues[stemAngle].reach * handlebarHeightParams * 0.9;
		    const frameStack = (stackPlus - handlebarStack).toFixed(2);
		    const frameReach = (reachPlus - handlebarReach).toFixed(2);
		    this.fittingResults = {
		        seatHeight,
		        saddleSetback: (torsoLength / 10).toFixed(2),  // 示例后移量计算
		        stackPlus,
		        reachPlus,
		        frameStack,
		        frameReach,
		    };
		    this.calculated = true;
		},
	    calculateHandlebarCoefficient(height) {
		    const minHeight = 165;
		    const maxHeight = 190;
		    const minCoefficient = 0.7;
		    const maxCoefficient = 1;
		    
		    if (height <= minHeight) {
			    return minCoefficient;
		    } else if (height >= maxHeight) {
			    return maxCoefficient;
		    } else {
			    // 线性插值计算系数
			    return ((height - minHeight) / (maxHeight - minHeight)) * (maxCoefficient - minCoefficient) + minCoefficient;
		    }
	    },
        getAdjustedDropRange(height, ridingPreference) {
            // 基础的落差参数范围
            const baseRanges = {
                comfort: [[150, 160, 0, 20], [160, 170, 10, 30], [170, 180, 20, 40], [180, 190, 30, 50], [190, 200, 40, 60]],
                neutral: [[150, 160, 20, 30], [160, 170, 30, 50], [170, 180, 40, 70], [180, 190, 50, 90], [190, 200, 60, 100]],
                aggressive: [[150, 160, 30, 70], [160, 170, 50, 80], [170, 180, 70, 120], [180, 190, 90, 140], [190, 200, 100, 160]],
            };

            // 根据表中提供的建议，将所有落差参数范围的数值减少20mm，以符合实际需求
            const adjustedRanges = baseRanges[ridingPreference].map(range => {
                return [range[0], range[1], range[2], range[3] ];
            });

            // 查找调整后的推荐的落差范围
            for (const range of adjustedRanges) {
                if (height >= range[0] && height <= range[1]) {
                    return(range[2] + range[3]) / 2;  // 返回范围的平均值作为推荐值，且不小于0
                }
            }
            return 0;  // 默认返回0
        },
        saveToLocalStorage() {
            localStorage.setItem('bikeFittingData', JSON.stringify(this.form));
            localStorage.setItem('bikeFittingResults', JSON.stringify(this.fittingResults));
            alert('数据已保存！');
        },
        loadFromLocalStorage() {
            const savedData = localStorage.getItem('bikeFittingData');
            const savedResults = localStorage.getItem('bikeFittingResults');
            if (savedData) {
                this.form = JSON.parse(savedData);
            }
            if (savedResults) {
                this.fittingResults = JSON.parse(savedResults);
                this.calculated = true;
            }
        },
        generatePDF() {
		    const doc = new jsPDF();
		
		    // Add a font that supports English characters
		    doc.setFont('helvetica');
		
		    doc.text('Bike Fitting Report', 10, 10);
		    doc.autoTable({
		        head: [['Parameter', 'Value']],
		        body: [
		            ['Height (cm)', this.form.height],
		            ['Inseam Height (cm)', this.form.inseamHeight],
		            ['Torso Length (cm)', this.form.torsoLength],
		            ['Arm Length (cm)', this.form.armLength],
		            ['Shoulder Width (cm)', this.form.shoulderWidth],
		            ['Flexibility Score', this.form.flexibilityScore],
		            ['Core Strength Score', this.form.coreStrengthScore],
		            ['Riding Preference', this.form.ridingPreference],
		            ['Seat Height (cm)', this.fittingResults.seatHeight],
		            ['Saddle Setback (cm)', this.fittingResults.saddleSetback],
		            ['Stack Plus (mm)', this.fittingResults.stackPlus],
		            ['Reach Plus (mm)', this.fittingResults.reachPlus],
		            ['Recommended Frame Stack (mm)', this.fittingResults.frameStack],
		            ['Recommended Frame Reach (mm)', this.fittingResults.frameReach],
		        ]
		    });
		    doc.save('BikeFittingReport.pdf');
        },
    }
};
</script>

<style scoped>
.bike-fitting-calculator {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;

    .el-button+, .el-button{
        margin-left: 0 !important;
    }
}

@media (max-width: 768px) {
    .bike-fitting-calculator {
        padding: 10px;
    }
}

@media (max-width: 430px) {
    .bike-fitting-calculator {
        padding: 5px;
    }

    .el-form-item__label {
        font-size: 14px;
    }

    .el-input, .el-input-number, .el-select {
        width: 100%;
    }

    .el-button {
        width: 100%;
        margin-bottom: 10px;
	    margin-left: 10px;
    }

    .el-card {
        padding: 10px;
    }

    .el-card p {
        font-size: 14px;
    }
}
</style>
