
// The Following standard JavaScript Packages Are Installed: 
// $npm install @stdlib/math ( https://github.com/stdlib-js/stdlib#install_namespaces)
// $npm install @stdlib/stats (https://www.npmjs.com/package/@stdlib/stats)


//const incrmax = require("@stdlib/stats/incr/max");
//const incrmin = require("@stdlib/stats/incr/min");
//const incrmean = require("@stdlib/stats/incr/mean");


import incrmax from 'https://unpkg.com/fp-stdlib@0.13.0-beta.6/stdlib.js';
import incrmin from 'https://unpkg.com/fp-stdlib@0.13.0-beta.6/stdlib.js';
//import incrmean from 'https://unpkg.com/fp-stdlib@0.13.0-beta.6/stdlib.js';


// Idea: Create an Object based on this type for Each Column in the Table Analyzer view to hold Univariate statistical metrics
// The other code parts of the XRStory project would only interface with this code by sending an array to this function
function calcUniVariateDataVizStat(arr, number1, number2){
  const statslocal = {
    'min': incrmin(),
    'max': incrmax(),
    'mean': incrmean(),
    'variance': variance(arr),
    'standardDeviation': standardDeviation(arr),
    'valueAtRisk': valueAtRisk(arr, number1),
    'tailValueAtRisk': tailValueAtRisk(arr, number2),
    'kurtosis': kurtosis(arr),
    'skewness': skewness(arr)
    // Add: 'normalDistributionPtest': normalDistributionPtest(arr),   i.e., a p-value/array of hypothesis tested of various distributions (uniform, poisson, exponential, normal, Heavy Tailed) - indicating most likely statistical distribution that describes the data
    // All of this data can e.g. be presented on a TableAnalyzer brick - you would like to see it at the same time as you look 
    // at the graphical e.g. 3D-scatter, if you filter out data, you should do a refresh of these metrics with the new relevant remaining array etc. 
   };
  for ( let i = 0; i < arr.length; i++ ) {
    statslocal.max( arr[i] );
    statslocal.min( arr[i] );
    statslocal.mean( arr[i] );
    //console.log( 'min: %d, max: %d, mean: %d, variance: %d, standard deviation: %d, VaR: %d, TVaR %d', statslocal.min(), statslocal.max(), statslocal.mean(), statslocal.variance, statslocal.standardDeviation, statslocal.valueAtRisk, statslocal.tailValueAtRisk);
  }
return statslocal; 
}

// Begin of ERROR HANDLING SECTION
function CheckNumericArray(arr) {
    return !arr.some(isNaN);
  }
  
  //Check whether is a number or not
  // http://www.endmemo.com/js/jstatistics.php
  function isNum(args) {
    args = args.toString();
    if (args.length == 0) return false;
    for (let i = 0; i < args.length; i++) {
      if ((args.substring(i, i + 1) < "0" || args.substring(i, i + 1) > "9") &&
        args.substring(i, i + 1) != "." && args.substring(i, i + 1) != "-") {
        return false;
      }
    }
    return true;
  }
  // End of ERROR HANDLING SECTION
  
  // BEGIN of STATISTICAL CALCULATIONS - UNIVARIATE SECTION

  // average/mean estimator http://www.endmemo.com/js/jstatistics.php
  function average(arr) {
    let len = 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == "") {} else if (!isNum(arr[i])) {
        alert(arr[i] + " is not number!");
        return;
      } else {
        len = len + 1;
        sum = sum + parseFloat(arr[i]);
      }
    }
    return sum / len;
  }
  
  // Variance of a number array http://www.endmemo.com/js/jstatistics.php
  function variance(arr) {
    let len = 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == "") {} else if (!isNum(arr[i])) {
        //alert(arr[i] + " is not number, Variance Calculation failed!"); //To catch errors!
        return 0; // Could use other specificer to escalate issue with data?
      } else {
        len = len + 1;
        sum = sum + parseFloat(arr[i]);
      }
    }
    let v = 0;
    if (len > 1) {
      let mean = sum / len;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] == "") {} else {
          v = v + (arr[i] - mean) * (arr[i] - mean);
        }
      }
      return v / len;
    } else {
      return 0;
    }
  }
  
  function standardDeviation(arr) {
    let x = variance(arr);
    let y = Math.sqrt(x);
    return y;
  }
  
  function sumArray(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum = sum + arr[i];
    }
    return sum;
  }
  
  function max(arr) {
    let x = Math.max.apply(Math, arr);
    return x;
  }
  
  function min(array) {
    let x = Math.min.apply(Math, array);
    return x;
  }

  function valueAtRisk(arr, number) { //number in range [0,1] should work
    if (CheckNumericArray(arr) == true) {
      let position; // position in array
      let index; //index in array (position -1), since arrays are indexed from zero
      if (number == 1) {
        position = arr.length;
      } else {
        position = Math.floor(number * arr.length + 1);
      }
      // Source for sort: https://www.w3schools.com/js/js_array_sort.asp
      arr.sort(function(a, b) {
        return a - b
      });
      //arr.reverse();
      index = position - 1;
      return arr[index];
    } else {
      return -99; // To use -99 for error caturing a non-numeric array on the receiving side
    }
  }
  
  function tailValueAtRisk(arr, number) { //number = confidence level in range [0,1] should work
    // MUST ADD error checking/bespoke defintiion for the boundary conditions where number = 0 or number =1 - Still To Be Coded
    if (CheckNumericArray(arr) == true) {
      let position; // position in array
      let index; //index in array (position -1), since arrays are indexed from zero
      let sum = 0;
      let TVaR = 0;
      let len = arr.length;
      position = Math.ceil(number * len);
      index = position - 1;
      arr.sort(function(a, b) {
        return a - b
      });
      for (let i = index + 1; i < len; i++) {
        sum = sum + arr[i]; }
      TVaR=1/(len*(1-number))*((position-number*len)*arr[index]+sum);
      return TVaR;
      }
     else {
      return -99; // To use -99?? for error caturing on the receiving side
    }
  }
  
// Kurtosis  https://stats.stackexchange.com/questions/504539/how-to-efficiently-calculate-skewness-and-kurtosis-of-data-having-value-with-rep
  function kurtosis(arr){
    let residuals = new Array();
    let pow2Residuals = new Array();
    let pow4Residuals = new Array();
    let sumPow2Residuals=0;
    let sumPow4Residuals=0;
    let avg = average(arr);
    let n = arr.length;
    let kurtosis=0;  // Implementing the "Standard unbiased estimator" from https://en.wikipedia.org/wiki/Kurtosis

    for (let i = 0; i < arr.length; i++) {
      residuals[i] = arr[i]-avg;
      //console.log("Observation: %d, Mean: %d, Residual %d", arr[i] , avg, residuals[i]);
    }
    for (let i = 0; i < arr.length; i++) {
      pow2Residuals[i] = residuals[i]*residuals[i];
      sumPow2Residuals=sumPow2Residuals+pow2Residuals[i];
      //console.log("pow2Residual %d, sumPow2Residual", pow2Residuals[i], sumPow2Residuals);
    }
    for (let i = 0; i < arr.length; i++) {
      pow4Residuals[i] = residuals[i]*residuals[i]*residuals[i]*residuals[i];
      sumPow4Residuals=sumPow4Residuals+pow4Residuals[i];
      //console.log("pow4Residual %d, sumPow4Residual", pow4Residuals[i], sumPow4Residuals);
    }
    kurtosis = ((n+1)*n*(n-1))/((n-2)*(n-3))*sumPow4Residuals/(sumPow2Residuals*sumPow2Residuals)-3*((n-1)*(n-1))/((n-2)*(n-3));
    return kurtosis;
  }
  
  function skewness(arr) { 
    // Implement the same one that is implemented in Excel: https://en.wikipedia.org/wiki/Skewness
    // adjusted Fisher–Pearson standardized moment coefficient: G_1
    let residuals = new Array();
    let pow2Residuals = new Array();
    let pow3Residuals = new Array();
    let sumPow2Residuals=0;
    let sumPow3Residuals=0;
    let avg = average(arr);
    let n = arr.length;
    let skew=0; 
    let g1=0; 

    for (let i = 0; i < arr.length; i++) {
      residuals[i] = arr[i]-avg;
      //console.log("Observation: %d, Mean: %d, Residual %d", arr[i] , avg, residuals[i]);
    }
    for (let i = 0; i < arr.length; i++) {
      pow2Residuals[i] = residuals[i]*residuals[i];
      sumPow2Residuals=sumPow2Residuals+pow2Residuals[i];
      //console.log("pow2Residual %d, sumPow2Residual", pow2Residuals[i], sumPow2Residuals);
    }
    for (let i = 0; i < arr.length; i++) {
      pow3Residuals[i] = residuals[i]*residuals[i]*residuals[i];
      sumPow3Residuals=sumPow3Residuals+pow3Residuals[i];
      //console.log("pow4Residual %d, sumPow4Residual", pow4Residuals[i], sumPow4Residuals);
    }
    //kurtosis = ((n+1)*n*(n-1))/((n-2)*(n-3))*sumPow4Residuals/(sumPow2Residuals*sumPow2Residuals)-3*((n-1)*(n-1))/((n-2)*(n-3));
    g1=1/n*sumPow3Residuals/Math.pow(1/n*sumPow2Residuals, 3/2);
    skew = Math.sqrt(n*(n-1))/(n-2)*g1;
    return skew;
  }


  // NOW, A section of FUNCTIONS devoted to testing the sample data against various
  // stochastic distributions. Both to get a sense for underlying driver but also since
  // some other statistical analysis only applies if the underlying data comes from certain 
  // (families of) stochastical distributions
  // NOTE - this type of test is really only meaningful if we have a set of independent observations, which 
  // may not exactly be the case with the type of manufactured data we tend to generate and then look at here....
function normalDistributionPtest(arr){
 // https://en.wikipedia.org/wiki/Normality_test & https://www.mdpi.com/2227-7390/9/7/788/htm
 // Try implementing the D'Agostino's K-squared test https://en.wikipedia.org/wiki/D%27Agostino%27s_K-squared_test
 // Then compare results to this online version: https://www.gigacalculator.com/calculators/normality-test-calculator.php
 // return pValue;
}


  // END of STATISTICAL CALCULATIONS - UNIVARIATE SECTION
  

  // BEGIN of STATISTICAL CALCULATIONS - MULTIVARIATE SECTION
  function pearsonCorrelation (arr){
  //https://en.wikipedia.org/wiki/Coefficient_of_multiple_correlation
  // To be Coded
  }

  // function xx (arr) {}
  // function xx (arr) {}
  // function xx (arr) {}
  // function xx (arr) {}
  // function xx (arr) {}
  // END of STATISTICAL CALCULATIONS - MULTIVARIATE SECTION

  // **************************************
  // TEST OF CODE AND IMPLEMENTATION
  // **************************************
  function createDummyArray(number){ // Create some uniform random numbers as a starting point
    let dummyArray = new Array();
    for (let i = 0; i < number; i++) {
      dummyArray[i]=Math.random();
    }
  return dummyArray;
  }
  
  let confidenceLevelVaR = 0.85;
  let confidenceLevelTVaR = 0.85;
  //let arrayProper = [24, 88, 12, 4];
  //let arrayNonNumeric = [24, 88, 12, 'A'];
  let arrayProper = createDummyArray(100000);
  console.log("XR Story Statistical Sandbox:")
  console.log("Array: ", arrayProper)
  dataVizStat = calcUniVariateDataVizStat(arrayProper, confidenceLevelVaR, confidenceLevelTVaR);
  console.log( 'Min: %d, Max: %d, Mean: %d, Variance: %d, Std.dev: %d, VaR(%d perc): %d, TVaR(%d perc): %d, Kurtosis: %d, Skewness: %d', dataVizStat.min(), dataVizStat.max(), dataVizStat.mean(), dataVizStat.variance, dataVizStat.standardDeviation, confidenceLevelVaR*100, dataVizStat.valueAtRisk, confidenceLevelTVaR*100, dataVizStat.tailValueAtRisk, dataVizStat.kurtosis, dataVizStat.skewness);

  // NOTE -[KOLLA MED ROBERT] it would be good to have a native implementation here that pulls in 
  // the data from our .csv file of the type that is being used for e.g. the 3D Scatter (e.g. Large Sample Data Set) instead of just using Dummy Data
  // i.e. something of the following form that would leverage the "Import your own data, Load a CSV functionality" from scatter objects Import Data
  // let dataMatrix = LoadCSVFileWithArbitraryColumns();
  // dataVizStat = calcUniVariateDataVizStat(dataMatrix("selected column"), confidenceLevel); // Would use one of the selected columns in the dataMatrix and calculate various statistics out of it


  // LEGACY SECTION FOLLOWS
  //
  //console.log("Check: is this array: ", arrayProper, " only containing numbers? ", CheckNumericArray(arrayProper), '<br />')
  //console.log("Check: is this array: ", arrayNonNumeric, " only containing numbers? ", CheckNumericArray(arrayNonNumeric), '<br />')
  // console.log('<br />', "Various Code Snippets for testing and display:", '<br />');
  // console.log("Proper numeric array: ", arrayProper, '<br />');
  // console.log("Array with Non-numeric items: ", arrayNonNumeric, '<br />');
  // console.log("Standard Deviation of: ", standardDeviation(arrayProper), '<br />');
  // console.log("Sum: ", sumArray(arrayProper), '<br />');
  // console.log("Max: ", max(arrayProper), '<br />');
  // console.log("Min: ", min(arrayProper), '<br />');
  // console.log("Average: ", average(arrayProper), '<br />');
  // console.log('<br />', "Test Driven Design Section:", '<br />')
  // // Reference in Test Driven Design (TDD) Supporting Excel sheet: '#1 Variance of an array'
  // console.log("Variance (TDD #1): ", variance(arrayProper), '<br />');
  // // Reference in Test Driven Design (TDD) Supporting Excel sheet: '#2 Standard Deciation of an array'
  // console.log("Standard Deviation (TDD #2): ", standardDeviation(arrayProper), '<br />');
  // // Reference in Test Driven Design (TDD) Supporting Excel sheet: '#3 Standard Deviation of a non-numeric array'
  // console.log("Standard Deviation of non-numeric (TDD #3): ", standardDeviation(arrayNonNumeric), '<br />');
  // console.log("ValueAtRisk (TDD #4): ", valueAtRisk(arrayProper, 0.85), '<br />'); // Last parameter value between 0 and 1
  // console.log("ValueAtRisk of a non-numeric array (TDD #5): ", valueAtRisk(arrayNonNumeric, 0.85), '<br />'); // Last parameter value between 0 and 1
  // console.log("TailValueAtRisk (TDD #6): ", tailValueAtRisk(arrayProper, 0.85), '<br />'); // Last parameter value between 0 and 1
  // console.log("Kurtosis: ", kurtosis(arrayProper), '<br />');

  // For further reading: https://javascript-conference.com/blog/real-time-statistics-stdlib/