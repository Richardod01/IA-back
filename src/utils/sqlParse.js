/**
 * function to updates
 * @param {*} tabla Name of table to modify
 * @param {*} data Object with data and their column
 * @param {*} condition Value and conditional to modify fields
 * @returns 
 */
const parseUpdateArray = (tabla = "", data = {}, condition = { value: "", index: "" }) => {
    const arrayOfUpdates = []
    Object.keys(data).map((keyName, i) => {
        arrayOfUpdates.push({
            sql: `UPDATE ${tabla} SET ${keyName} = ? WHERE ${condition.index} = ? `,
            args: [data[keyName], condition.value]
        })
    })
    return arrayOfUpdates
}
/**
 * function to updates
 * @param {*} tabla Name of table to modify
 * @param {*} data Object with data and their column
 * @param {*} condition Value and conditional to modify fields
 * @returns 
 */
const parseUpdateArrayMultpleCondition = (tabla = "", data = {}, condition = [{ value: "", index: "" }]) => {
    const arrayOfUpdates = []
    let conditional = ""
    condition.map((cond, index) => {
        index + 1 < condition.length ? conditional = conditional + `${cond.index} = ${cond.value} and ` : conditional = conditional + `${cond.index} = ${cond.value}`
    })

    Object.keys(data).map((keyName, i) => {
        arrayOfUpdates.push({
            sql: `UPDATE ${tabla} SET ${keyName} = ? WHERE ${conditional}`,
            args: [data[keyName]]
        })
    })
    return arrayOfUpdates
}
/**
 * Funtion to parse object to insert data
 * @param {String} tabla Name of the table that you want to insert
 * @param {*} data Object wich contains the data you want to insert
 * @returns Array thath containes the query
 */
const parseInsertArray = (tabla = "", data = {}) => {
    let names = ""
    let complementarie = ""
    const arrayOfData = []
    const keyNames = Object.keys(data)
    keyNames.map((keyName, index) => {
        index + 1 < keyNames.length ? names = names + keyName + ", " : names = names + keyName
        index + 1 < keyNames.length ? complementarie = complementarie + "?" + ", " : complementarie = complementarie + "?"
        arrayOfData.push(data[keyName])
    })
    return [{
        sql: `INSERT INTO ${tabla} ( ${names} ) values ( ${complementarie} )`,
        args: arrayOfData
    }]
}
module.exports = { parseUpdateArray, parseInsertArray, parseUpdateArrayMultpleCondition };