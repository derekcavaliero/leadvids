# jquery.leadvids

## What does Leadvids do?

Leadvids is a simple jQuery plugin that adds the ability to display a JavaScript rendered form to a user at a specific moment during video streaming. This feature is available in platforms such as Wistia, Brightcove, and Vimeo - but generally requires a specific plan to be purchased.

![image](https://user-images.githubusercontent.com/5420084/47617877-883c2400-daa2-11e8-85b6-275343d5db6e.png)

## Dependencies

- jQuery
- Form Library (varies by provider)

### An Important Note On HTML Structure

Because this plugin relies on placing an overlay on top of the video player - it is highly recommended that you implement a wrapper that forces a specific aspect ratio. Leadvids does not add a wrapper around the embedded players. The reasoning for this is because the jQuery `.wrap()` function causes the iframe element to reload - which is bad for multiple reasons (namely performance). Therefore, use something such as the Responsive Embed component in Bootstrap 3 (https://getbootstrap.com/docs/3.3/components/#responsive-embed) to format your video embed code.

Failure to do this will result in strange and unpredictable behavior - you have been warned.

## Quick Example (using HubSpot)

```html
<!-- HTML Markup -->
<div class="embed-responsive embed-responsive-16by9">
  <iframe src="https://player.vimeo.com/video/xxxxxx" class="myLeadvid" allowfullscreen></iframe>
</div>
      
<!-- Dependencies -->
<!-- jQuery -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
<!-- HubSpot Forms Library -->
<script src="//js.hsforms.net/forms/v2.js"></script>

<!-- jquery.leadvids.js -->
<script src="/path/to/jquery.leadvids.js"></script>
<script>
// Globally update the form provider defaults
$.fn.leadvids.defaults = {
  provider: {
    type: 'hubspot',
    id: 2660377
  }
};

// Initialize a leadvids collection
$('.myLeadvid').leadvids({
  formId: '6f7e41d0-60e1-42e1-a2cd-7f0fcf07d734',
  freepass: true,
  freepassButtonClass: 'btn btn-link',
  freepassLimit: 1,
  submitButtonClass: 'btn btn-block btn-primary',
  threshold: 10,
  thresholdUnit: '%'
});
</script>
```

## Data API

Leadvids allows for option overrides through HTML5 data-attributes. All data attributes are namespaced with a `leadvids` key:

- `form-id`
- `freepass`
- `threshold`
- `threshold-unit`
- ...etc

## What video providers are supported?

At this moment, Leadvids supports the following video providers:

- Vimeo

Additional providers will be added in the future. 

## What form providers are supported?

Leadvids supports the following embedded form providers:

- HubSpot
- Marketo

## Browser & Device Support

**Mobile**

In an effort to provide the best user experience, Leadvids will not function when the viewport width is less than 768px. This is for 2 reasons:

1. Certain mobile browsers (such as iOS) automatically play the video in fullscreen mode.
2. The players would be too small to provide a usable interface.

**Tablet & Desktop**

- IE 11+ 

Support may vary depending on capabilities of each video and form provider.

See the links below for each providers API reference:

- Vimeo - https://github.com/vimeo/player.js#browser-support
