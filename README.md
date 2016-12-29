### Pipe Band Manager
* [Version 1 Release Notes](https://github.com/aric87/highland_member/releases/tag/1)
* A web based band management software designed for smaller pipe bands. While larger bands may have more resources, funding, and need for a more interactive web presence, smaller bands really just need a place to put their stuff, and get vital info.
* Features include:
 * Music library
 * Document library
 * Member directory
 * Admin interface for managing members, and content
 * Announcements
 * Public facing site that dynamically builds based on the member side
 * Event commitment interface so members can mark if their going to an Event (v2)
 * Uniform checklist to keep members from showing up without their stuff (v2)
 * More (email suggestions to aric@nightwolfweb.com)
* If you'd like to get your band using this, shoot me a message.


### Tech Talk
This uses Node, Express, Mongo, NGINX, and Redis.
It's currently not the most gorgeous code I've ever written. Many of the things I've done in this app were learned as I did them (the primary reason I've built it). If you want to get up and running with this before real instructions get written, shoot me a message.


### license type legal things
If you'd like to contribute, please do. I'd love to hear about any bugs you find, feature suggestions, or better ways to maintain this stuffs.

If you'd like to pull it down, and run it for your own band, I'd love that and you're free to do so.

If you're going to launch it and charge someone (like, your rival band?), please be considerate. It was built with the intention of helping out small bands/ non-profits with admin tasks they may struggle with. As such, I'd appreciate that you only charge enough to cover your server space, and a small amount there after (meaning, you shouldn't make more than $20/ month).

### Changelog
- 1.0.1  [release notes](https://github.com/aric87/highland_member/releases/tag/v1.0.1)
- 1.0.2
    - make the things more responsive like
    - add call, email, text to directory/ admin interface
    - add preferred contact method field
    - add "can text" field


#### To-do List
V1.1
  [X] admin contact user interface (email, text etc.)
  [ ] public content:
    - static pages
    - contact form

V1.2
  [ ] photo gallery
  [ ] event registrations

V1.3
  [ ] public content:
    - insert based templates
    - dynamic nav based on turned on pages
    - give docs permissions and create doc view template
    - create tune list view
    - public member directory


Beyond
  * delete documents, venues, events, users
  * write cron for DB backups
  * add bug report form
