{% extends "./relation_guide.tmpl" %}

{% block pointerOneToOneSave %}
```objc
AVObject *game= [AVObject objectWithClassName:@"Game"];
[game setObject:[AVUser currentUser] forKey:@"createdBy"];
```
{% endblock %}

{% block pointerOneToOneQuery %}
```objc
AVQuery *gameQuery = [AVQuery queryWithClassName:@"Game"];
[gameQuery whereKey:@"createdBy" equalTo:[AVUser currentUser]];
```
{% endblock %}

{% block pointerOneToOneGet %}
```objc
// say we have a Game object
AVObject *game = ...
 
// getting the user who created the Game
AVUser *createdBy = [game objectForKey@"createdBy"];
```
{% endblock %}

{% block avobjectArraySave %} 
```objc
// let's say we have four weapons
AVObject *scimitar = ...
AVObject *plasmaRifle = ...
AVObject *grenade = ...
AVObject *bunnyRabbit = ...
 
// stick the objects in an array
NSArray *weapons = @[scimitar, plasmaRifle, grenade, bunnyRabbit];
 
// store the weapons for the user
[[AVUser currentUser] setObject:weapons forKey:@"weaponsList"];
```
{% endblock %}

{% block avobjectArrayGet %}
```objc
NSArray *weapons = [[AVUser currentUser] objectForKey:@"weaponsList"];
```
{% endblock %}

{% block relatedClassQueryFrom %}
```objc
// set up the query on the Follow table
AVQuery *query = [AVQuery queryWithClassName:@"Follow"];
[query whereKey:@"from" equalTo:[AVUser currentUser]];
 
// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(AVObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the to key
    AVUser *otherUser = [o objectForKey:@"to"];
 
    // to get the time when we followed this user, get the date key
    NSDate *when = [o objectForKey:@"date"];
  }
}];
```
{% endblock %}

{% block avobjectArrayQueryIncludeKey %}
```objc
// set up our query for a User object
AVQuery *userQuery = [AVUser query];
 
// configure any constraints on your query...
// for example, you may want users who are also playing with or against you
 
// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
[userQuery includeKey:@"weaponsList"];
 
// execute the query
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects contains all of the User objects, and their associated Weapon objects, too
}];
```
{% endblock %}

{% block avobjectArrayQueryContainedIn %}
```objc
// add a constraint to query for whenever a specific Weapon is in an array
[userQuery whereKey:@"weaponsList" equalTo:scimitar];
 
// or query using an array of Weapon objects...
[userQuery whereKey:@"weaponsList" containedIn:arrayOfWeapons];
```
{% endblock %}

{% block avrelationSave %}
```objc
// let’s say we have a few objects representing Author objects
AVObject *authorOne = …
AVObject *authorTwo = …
AVObject *authorThree = …

// now we create a book object
AVObject *book= [AVObject objectWithClassName:@"Book"];
 
// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
AVRelation *relation = [book relationforKey:@"authors"];
// make sure these objects should be saved to server before adding to relation
[relation addObject:authorOne];
[relation addObject:authorTwo];
[relation addObject:authorThree];
 
// now save the book object
[book saveInBackground];
```
{% endblock %}

{% block avrelationQuery %}
```objc
// suppose we have a book object
AVObject *book = ...
 
// create a relation based on the authors key
AVRelation *relation = [book relationforKey:@"authors"];
 
// generate a query based on that relation
AVQuery *query = [relation query];
 
// now execute the query
```
{% endblock %}

{% block avrelationQueryEqualTo %}
```objc
// suppose we have a author object, for which we want to get all books
AVObject *author = ...
 
// first we will create a query on the Book object
AVQuery *query = [AVQuery queryWithClassName:@"Book"];
 
// now we will query the authors relation to see if the author object 
// we have is contained therein
[query whereKey:@"authors" equalTo:author];
```
{% endblock %}

{% block relatedClassSave %}
```objc
// suppose we have a user we want to follow
AVUser *otherUser = ...
 
// create an entry in the Follow table
AVObject *follow = [AVObject objectWithClassName:@"Follow"];
[follow setObject:[AVUser currentUser]  forKey:@"from"];
[follow setObject:otherUser forKey:@"to"];
[follow setObject:[NSDate date] forKey:@"date"];
[follow saveInBackground];
```
{% endblock %}

{% block relatedClassQueryTo %} 
```objc
// set up the query on the Follow table
AVQuery *query = [AVQuery queryWithClassName:@"Follow"];
[query whereKey:@"to" equalTo:[AVUser currentUser]];
 
// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(AVObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the from key
    AVUser *otherUser = [o objectForKey:@"from"];
 
    // to get the time the user was followed, get the date key
    NSDate *when = [o objectForKey:@"date"];
  }
}];
```
{% endblock %}

{% block avobjectArrayManyToManySave %} 
```objc
// let's say we have an author
AVObject *author = ...
 
// and let's also say we have an book
AVObject *book = ...
 
// add the author to the authors list for the book
[book addObject:author forKey:@"authors"];
```
{% endblock %}

{% block avobjectArrayManyToManyQuery %}
```objc
// set up our query for the Book object
AVQuery *bookQuery = [AVQuery queryWithClassName:@"Book"];
 
// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];
 
// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated 
    // Author objects, too
}];
```
{% endblock %}

{% block avobjectArrayManyToManyGet %} 
```objc
NSArray *authorList = [book objectForKey@"authors"];
```
{% endblock %}

{% block avobjectArrayManyToManyQueryEqualTo %}
```objc
// suppose we have an Author object
AVObject *author = ...
 
// set up our query for the Book object
AVQuery *bookQuery = [AVQuery queryWithClassName:@"Book"];
 
// configure any constraints on your query...
[bookQuery whereKey:@"authors" equalTo:author];
 
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];
 
// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated Author objects, too
}];
```
{% endblock %}
