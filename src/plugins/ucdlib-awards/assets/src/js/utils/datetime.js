class UcdlibAwardsUtilsDatetime {

  /**
   * @description Convert mysql datetime string to simple date string, assuming same timezone
   * @param {String} dateTimeString - mysql datetime string
   */
  mysqlToDateString(dateTimeString) {
    if ( !dateTimeString ) return '';
    try {
      const date = dateTimeString.split(' ')[0];
      return date;
    } catch(e) {
      console.error('Error formatting date', dateTimeString);
      return '';
    }
  }

  /**
   * @description Convert mysql datetime string to locale string
   * @param {String} dateTimeString - mysql datetime string
   * @param {Boolean} includeTime - whether to include time in the string
   * @param {Boolean} dtSeparator - separator between date and time
   * @returns
   */
  mysqlToLocaleString(dateTimeString, includeTime, dtSeparator = ' - ') {
    if ( !dateTimeString ) return '';
    try {
      const date = new Date( dateTimeString.split(' ').join('T') + 'Z' );
      const dateString = date.toLocaleDateString('en-US', {dateStyle: 'medium'});
      if ( !includeTime ) return dateString;
      const timeString = date.toLocaleTimeString('en-US', {timeStyle: 'short', hour12: true});
      return dateString + dtSeparator + timeString;
    } catch(e) {
      console.error('Error formatting date', dateTimeString);
      return '';
    }
  }

  mysqlToLocaleStringTime(dateTimeString) {
    if ( !dateTimeString ) return '';
    try {
      const date = new Date( dateTimeString.split(' ').join('T') + 'Z' );
      return date.toLocaleTimeString('en-US', {timeStyle: 'short', hour12: true});
    } catch(e) {
      console.error('Error formatting date', dateTimeString);
      return '';
    }
  }

}

export default new UcdlibAwardsUtilsDatetime();
