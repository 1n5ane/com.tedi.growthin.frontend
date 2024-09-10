export default class DateUtils {

    static formatDate = (dateString) => {
        const date = new Date(dateString);

        // Extract the day, month, and year
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        // Extract the hours and minutes
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // whether it's AM or PM
        const isPM = hours >= 12;
        const period = isPM ? 'PM' : 'AM';

        // Convert hours to 12-hour format
        if (hours > 12) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }

        // Format time as either 24-hour or 12-hour with AM/PM
        const formattedTime = isPM
            ? `${String(date.getHours()).padStart(2, '0')}:${minutes}`  // 24-hour format
            : `${hours}:${minutes} ${period}`;  // 12-hour format with AM/PM

        return `${day}/${month}/${year}, ${formattedTime}`;
    }
}