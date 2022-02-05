import * as request from 'supertest';

/* 
Ideas to expand functionality to support dates/locations

- use different endpoint to get woeid from location by title (/api/location/search query)
    - return response.body[0].woeid

- use switch statement to convert string phases like (yesterday/tomorrow/today) to date value)
   - add support for (next/previous) which can be done with Regex (next/previous 60 days)
   - example switch case statement (case "yesterday" : return addDaysToNow(-1))
   - addDaysToNow method will add or minus days from today/now

async function addDaysToNow(days: number)
{
    const date = new Date();
    date.setDate(date.getDate() + days);
    let newDate = date.toISOString().split('T')[0];
    return newDate.replace(/-/g,'/')
}

  - example suite
   describe...
   test... {
        let locationWoeid = getLocationByName('London'); 
        let today = getDateByConvertingString('today');
        concat request `api/location/${locationWoeid}/${today}`
    }   
*/

function getDateString(day: number)
{
    const date = new Date();
    date.setDate(date.getDate() + day);
    let newDate = date.toISOString().split('T')[0];
    return newDate.replace(/-/g,'/')
}

describe('GET /api/location/(woeid)/', () => {
    const nottinghamWoeid = '30720' //to ensure you are getting correct location pass through other API that returns woeid
    const tomorrow = getDateString(1);

    test('get nottingham weather for tomorrow', async () => {
        let response = await request('https://www.metaweather.com/').get(`api/location/${nottinghamWoeid}/${tomorrow}/`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).not.toBeEmpty();
    });

    test('get nottingham weather for tomorrow and confirm contract properties', async () => {
        let response = await request('https://www.metaweather.com/').get(`api/location/${nottinghamWoeid}/${tomorrow}/`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).not.toBeEmpty();
        expect(typeof response.body[0].predictability).toBe("number")
        //other response body checks
    });

    test('negative - enter date more than 10 days into the future for nottingham', async () => {
        let date = getDateString(11);
        let response = await request('https://www.metaweather.com/').get(`api/location/${nottinghamWoeid}/${date}/`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toBeEmpty();
    });

    test('negative - get weather by incorrect woeid for tomorrow', async () => {
        let response = await request('https://www.metaweather.com/').get(`api/location/00000/${tomorrow}/`);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({detail: "Not found."});
    });

    test('negative - incorrect calendar date for nottingham', async () => {
        let response = await request('https://www.metaweather.com/').get(`api/location/${nottinghamWoeid}/2021/02/30/`);
        expect(response.statusCode).toEqual(500); //bad request would my preferred
    });
});

