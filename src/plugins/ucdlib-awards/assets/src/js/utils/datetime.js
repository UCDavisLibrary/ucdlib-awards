class UcdlibAwardsUtilsDatetime {

  constructor() {
    this.months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
  }

  /**
   * @description Convert mysql datetime string to simple date string, assuming same timezone
   * @param {String} dateTimeString - mysql datetime string
   */
  mysqlToDateString(dateTimeString, fmt) {
    if ( !dateTimeString ) return '';
    try {
      let date = dateTimeString.split(' ')[0];
      if ( fmt ) {
        date = new Date( date );
        date = `${this.months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
      }
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
  mysqlToLocaleString(dateTimeString, args={}) {
    if ( !dateTimeString ) return '';
    let { includeTime, dtSeparator, keepTimezone } = args;
    if ( !dtSeparator ) dtSeparator = ' - ';
    try {
      let date;
      if ( keepTimezone ) {
        date = new Date( dateTimeString );
      } else {
        date = new Date( dateTimeString.split(' ').join('T') + 'Z' );
      }
      const dateString = date.toLocaleDateString('en-US', {dateStyle: 'medium'});
      if ( !includeTime ) return dateString;
      const timeString = date.toLocaleTimeString('en-US', {timeStyle: 'short', hour12: true});
      return dateString + dtSeparator + timeString;
    } catch(e) {
      console.error('Error formatting date', dateTimeString);
      return '';
    }
  }

  mysqlToLocaleStringTime(dateTimeString, args={}) {
    const keepTimezone = args.keepTimezone || false;
    if ( !dateTimeString ) return '';
    try {
      let date;
      if ( keepTimezone ) {
        date = new Date( dateTimeString );
      } else {
        date = new Date( dateTimeString.split(' ').join('T') + 'Z' );
      }
      return date.toLocaleTimeString('en-US', {timeStyle: 'short', hour12: true});
    } catch(e) {
      console.error('Error formatting date', dateTimeString);
      return '';
    }
  }

}

export default new UcdlibAwardsUtilsDatetime();
