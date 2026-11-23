"""Public Funergy Group pages for TOTOYA's Kamata design."""


def company_content():
    sister_restaurants = (
        ('Yakitori izakaya', 'Tori Ton', 'Japanese yakitori and izakaya favorites, made for evenings around the table.', 'Tori Ton', 'toriton'),
        ('Tempura, sushi &amp; izakaya', 'Izakaya Tenkichi', 'Tempura, sushi and Japanese comfort food in a welcoming izakaya setting.', 'Tenkichi', 'tenkichi'),
        ('Japanese hamburg &amp; steak', 'Marujuu', 'Japanese-style hamburg steaks and steak dishes, served with care.', 'Marujuu', 'marujuu'),
        ('Charcoal grill &amp; oden', 'Izakaya LaLa', 'Charcoal-grilled dishes, oden and the warmth of a Japanese izakaya.', 'LaLa', 'izakayalala'),
    )
    cards = ''.join(
        f'<article class="group-restaurant"><p class="group-label">{style}</p>'
        f'<h3>{name}</h3><p>{desc}</p>'
        f'<a class="group-text-link" href="https://funergygroup.com/{path}">Discover {short}</a></article>'
        for style, name, desc, short, path in sister_restaurants
    )
    return f'''<div class="group-page">
  <nav class="group-section-nav" aria-label="Company sections">
    <a href="#our-group">Our group</a><a href="#sister-restaurants">Sister restaurants</a><a href="#careers">Careers</a><a href="#contact">Contact</a>
  </nav>
  <section id="our-group" class="group-hero" aria-labelledby="group-title">
    <div class="group-hero-title"><p class="group-label">The people behind Totoya</p>
      <h1 id="group-title">Part of<br>Funergy Group.</h1>
      <p class="group-hero-note">Japanese food.<br>Hawai‘i hospitality.<br>A little joy, every day.</p>
    </div>
    <div class="group-hero-photo"><img src="/assets/negitoro-counter.webp" width="1303" height="1640" alt="Negitoro bowls lined up at the Totoya counter"></div>
  </section>
  <div class="group-wrap group-profile">
    <div class="group-introduction"><p>Totoya is part of Funergy Group, a Honolulu-based restaurant company bringing Japanese food culture and warm hospitality to Hawai‘i.</p>
      <p>Each of our restaurants has its own character. What connects us is the care we put into our food, our teams and the people around our tables.</p>
      <div class="group-actions"><a class="group-button" href="https://funergygroup.com/">Visit Funergy Group</a><a class="group-text-link" href="https://funergygroup.com/company">More about our company</a></div>
    </div>
    <dl class="group-facts"><div><dt>Operated by</dt><dd>Funergy Group Inc.</dd></div><div><dt>Based in</dt><dd>Honolulu, Hawai‘i</dd></div><div><dt>Our home</dt><dd>2334 S King St, STE 203<br>Honolulu, HI 96826</dd></div></dl>
  </div>
  <section class="group-sisters" id="sister-restaurants" aria-labelledby="sisters-title"><div class="group-wrap">
    <div class="group-section-heading"><p class="group-label">Our sister restaurants</p><h2 id="sisters-title">Different tables.<br>A shared spirit.</h2>
      <p>More places to gather, more flavors to discover.<br>Meet the restaurants in our family.</p></div>
    <div class="group-restaurant-grid">{cards}</div>
    <div class="group-brands-link"><a class="group-text-link" href="https://funergygroup.com/brands">View all brands &amp; locations</a></div>
  </div></section>
  <section class="group-wrap group-careers" id="careers" aria-labelledby="careers-title">
    <div><p class="group-label">Grow with us</p><h2 id="careers-title">Bring your energy.<br>Find your place.</h2></div>
    <div><p>Enjoy good food, care about people and want to be part of a team? Explore opportunities with Totoya and our sister restaurants.</p>
      <p>Visit Funergy Group’s careers page for role information, or apply directly through the group’s application form.</p>
      <div class="group-actions"><a class="group-button" href="https://funergygroup.com/apply">Apply to join our team</a><a class="group-text-link" href="https://funergygroup.com/hiring">Explore careers</a></div>
    </div>
  </section>
  <section class="group-contact" id="contact" aria-labelledby="contact-title"><div class="group-wrap">
    <div class="group-section-heading"><p class="group-label">Let’s connect</p><h2 id="contact-title">We’d love<br>to hear from you.</h2>
      <p>For company enquiries, partnerships and general questions, get in touch with the Funergy Group team.</p></div>
    <div class="group-contact-grid"><div><h3>Company enquiries</h3><a class="group-email" href="mailto:office@funergygroup.com">office@funergygroup.com</a>
      <p>Send an email or use the contact form on our company website.</p><a class="group-text-link" href="https://funergygroup.com/contact">Open the contact form</a></div>
      <div><h3>Planning a visit to Totoya?</h3><p>For reservations, takeout orders or questions about your visit, please contact your chosen restaurant directly.</p>
        <a class="group-text-link" href="/#shopinfo">Find your Totoya location</a></div></div>
  </div></section>
</div>'''


def privacy_content():
    return '''<article class="group-page privacy-page">
  <header class="privacy-heading"><p class="group-label">Visitor information</p><h1>Privacy at Totoya.</h1></header>
  <div class="privacy-reading">
    <section><h2>Finding a restaurant</h2><p>When you choose “Find my nearest shop” and allow location access, your device compares distances to the three restaurants. Totoya does not store your coordinates. You can also select a landmark to see which shop is nearest to it.</p></section>
    <section><h2>Maps &amp; directions</h2><p>When the restaurant map loads map tiles, your browser connects to OpenStreetMap. Its servers receive the connection information needed to serve those tiles, including your IP address. Read the <a href="https://osmfoundation.org/wiki/Privacy_Policy">OpenStreetMap Foundation privacy policy</a> for details.</p><p>When you select directions from your current location and allow location access, the link sends your starting coordinates and selected restaurant to Google Maps. If you decline, you can choose a starting point in Google Maps.</p></section>
    <section><h2>Reservations &amp; orders</h2><p>Our reservation and pickup links take you to third-party services. When you open one of those websites or enter information there, that provider’s privacy practices apply. Review the provider’s privacy notice before you submit a booking or order.</p></section>
    <section><h2>Contact &amp; applications</h2><p>Company enquiries and job applications go to Funergy Group. You can contact the team by email or through the company website. For questions about this website or how your information is handled, visit <a href="/company/#contact">our contact page</a>.</p></section>
  </div>
</article>'''
