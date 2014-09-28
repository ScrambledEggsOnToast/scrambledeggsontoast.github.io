---
layout: page
title: Archives
---

<ul>
  {% for post in site.posts %}

    {% unless post.next %}
      <h3>{{ post.date | date: '%Y' }}</h3>
    {% else %}
      {% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
      {% capture nyear %}{{ post.next.date | date: '%Y' }}{% endcapture %}
      {% if year != nyear %}
        <h3>{{ post.date | date: '%Y' }}</h3>
      {% endif %}
    {% endunless %}

    <li style="text-indent: -2rem; margin-left: 2rem"><span style="font-size: 0.8rem">{{ post.date | date:"%d %B" }}</span> &mdash; <strong><a href="{{ post.url }}">{{ post.title }}</a></strong></li>
  {% endfor %}
</ul>

