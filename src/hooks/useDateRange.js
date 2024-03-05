import { useCallback, useMemo, useState } from "react";

/**
  
 * Custom React hook for generating a list of dates within a specified time interval
 * and implementing pagination for the generated date list.
 *
 * @param {object} getTime - An object containing temporal information, with an optional extent property.
 * @param {number} intervalTime - The time interval in milliseconds for generating dates.
 *
 * @returns {object} An object containing the generated date list, a function to set the current page number,
 *                  and a pagination function to retrieve a subset of dates based on the current page.
 */


const useDateRange = (getTime, intervalTime) => {


    const [pageNumber, setPageNumber] = useState(1);

    const dateList = useMemo(() => {
        const dateRange = [];

        const interval = getTime?.extent?.temporal?.interval;
        if (interval && interval.length === 1) {
            console.log("Interval")
            console.log("INTERVAL ARRAY", interval)


            const [start, end] = interval[0];

            let currentDate = new Date(start);
            let endingDate = new Date(end);

            while (currentDate.getTime() <= endingDate.getTime()) {
                dateRange.push(new Date(currentDate).toISOString());
                currentDate = new Date(currentDate.getTime() + intervalTime);
            }
        } else {
            console.log("Invalid interval format in getTime");
        }

        return dateRange;
    }, [getTime, intervalTime])

    // Todo implement pagination
    

    const pagination = useCallback((dateList) => {
        const start = (pageNumber - 1) * 10;
        total_page = Math.ceil(dateList.length / 10)


        if (total_page !== 0) {
            return dateList.slice(start, start + 10);
        }
        else {
            return []
        }
    }, [pageNumber])


    return { dateList, setPageNumber , pagination}
}

export { useDateRange }