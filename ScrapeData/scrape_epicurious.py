# load neceassy libraries
import time
import json
from bs4 import BeautifulSoup  # import beautifulsoup
from splinter import Browser  # import splinter
import pandas as pd # import pandas

executable_path = {'executable_path':'/usr/local/bin/chromedriver'}
browser = Browser('chrome', **executable_path)


# load the relevant urls_df to a pandas dataframe
urls_df = pd.read_csv('csv_urls/urls_df6.csv')

# initialize an empty list to store the recepies
recepie_list = []

# loop through each url
for url in urls_df.iloc[2000:,2]:
    browser.visit(url)
    time.sleep(2)

    # scrape page into soup
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')

    # extract preparation text
    try:
        preparation = soup.find_all("li", class_="preparation-step")
        preparation_text = []

        for steps in preparation:
            text = steps.text.strip()
            preparation_text.append(text)

        preparation_text = ''.join(preparation_text)

    except:
        preparation_text = None

    # extract review_rating
    try:
        review_rating = soup.find("meta", attrs={"itemprop": "ratingValue"})['content']
    except:
        review_rating = None

    # extract best rating
    try:
        best_rating = soup.find("meta", attrs={"itemprop": "bestRating"})['content']
    except:
        best_rating = None


    # extract number of reviews
    try:
        number_of_reviews = soup.find("span", class_="reviews-count").text
    except:
        number_of_reviews = None

    # extract the title of the recepie
    try:
        title_text = soup.find("div", class_="title-source").find('h1').text
    except:
        title_text = None

    # extract the make_it_again score
    try:
        make_it_again = soup.find("div", class_="prepare-again-rating").find('span').text
    except:
        make_it_again = None


    # extract the tags
    try:
        tags = soup.find("dl",class_='tags').find_all('dt')
        tags_list = []

        for tag in tags:
            tags_list.append(tag.text)
    except:
        tags_list = None


    # extract the list of INGREDIENTS
    try:
        ingredients = soup.find_all("li", class_="ingredient")
        ingredients_list = []
        for item in ingredients:
            ingredients_list.append(item.text)
    except:
        ingredients_list = None   


    # extract the image src
    try:
        img_src = soup.find('div', class_="recipe-image-container")
        img_src = img_src.find('div', class_="social-img")
        img_src = img_src.find('picture',class_='photo-wrap')
        img_src = img_src.find("img").attrs['srcset']
    except:
        img_src = None


    # store the extracted data into a python dictionary
    recepie = {"ingredients": ingredients_list, 
               "tags": tags_list, 
               "preparation": preparation_text,
               "title": title_text, 
               "rating": review_rating, 
               "bestrating": best_rating, 
               "makeitagainscore": make_it_again,
               "reviews":number_of_reviews,
               "imagesrc":img_src
              }


    # append the recepie to the list
    recepie_list.append(recepie)


# export the list of recepies to a pandas dataframe
receipe_df8 = pd.DataFrame(recepie_list)

# export the dataframe to a csv
receipe_df8.to_csv('receipe_df8.csv')
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    