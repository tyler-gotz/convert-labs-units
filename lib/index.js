var convert
var measures = {
  temperature: require('./definitions/temperature'),
  wbc: require('./definitions/wbc')
}
var Converter

Converter = function (numerator, denominator) {
  if(denominator)
    this.val = numerator / denominator;
  else
    this.val = numerator;
};

/**
* Lets the converter know the source unit abbreviation
*/
Converter.prototype.from = function (from) {
  if(this.destination)
    throw new Error('.from must be called before .to');
  
  this.origin = this.getUnit(from);

  if(!this.origin) {
    this.throwUnsupportedUnitError(from);
  }

  return this;
};

/**
* Converts the unit and returns the value
*/
Converter.prototype.to = function (to) {
  if(!this.origin)
    throw new Error('.to must be called after .from');

  this.destination = this.getUnit(to);

  var result
  var transform

  if(!this.destination) {
    this.throwUnsupportedUnitError(to);
  }

  // Don't change the value if origin and destination are the same
  if (this.origin.label === this.destination.label) {
    return this.val;
  }

  // You can't go from liquid to mass, for example
  if(this.destination.measure != this.origin.measure) {
    throw new Error('Cannot convert incompatible measures of '
      + this.destination.measure + ' and ' + this.origin.measure);
  }

  /**
  * Convert from the source value to its anchor inside the system
  */
  result = this.val * this.origin.to_anchor;

  /**
  * For some changes it's a simple shift (C to K)
  * So we'll add it when convering into the unit (later)
  * and subtract it when converting from the unit
  */
  if (this.origin.anchor_shift) {
    result -= this.origin.anchor_shift
  }

  transform = this.origin.transform;
  if (transform) {
    result = transform(result);
  }

  /**
  * This shift has to be done after the system conversion business
  */
  if (this.destination.anchor_shift) {
    result += this.destination.anchor_shift;
  }

  /**
  * Convert to another unit inside the destination system
  */
  return result / this.destination.to_anchor;
};

/**
* Finds the unit
*/
Converter.prototype.getUnit = function (abbr) {
  var found;
  
  Object.keys(measures).forEach((measure) => {
    const units = measures[measure]
    const measureFound = Object.keys(units).find((unit) => abbr === unit)
    if (measureFound) {
      found = units[measureFound]
    }
  })
  
  return found;
};


Converter.prototype.throwUnsupportedUnitError = function (what) {
  var validUnits = [];

  Object.keys(measures).forEach((measure) => {
    const units = measures[measure]
    validUnits = validUnits.concat(Object.keys(units))
  })

  throw new Error('Unsupported unit ' + what + ', use one of: ' + validUnits.join(', '));
}


convert = function (value) {
  return new Converter(value);
};

module.exports = convert;