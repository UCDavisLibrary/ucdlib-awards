class UcdlibAwardsUtilsDatetime {

  /**
   * @description Convert mysql datetime string to date string
   * @param {*} dateTimeString
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

}

export default new UcdlibAwardsUtilsDatetime();
