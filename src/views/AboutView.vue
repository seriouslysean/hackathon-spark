<template>
    <div class="headers">
        <div class="header-section">
            <h3>Dates</h3>
            <h4>Web</h4>
            <p>Nov 1, 2022</p>
            <h4>Mobile</h4>
            <p>Nov 2, 2022</p>

        </div>

      <div class="header-section">
          <h3>Web Versions</h3>
          <p><a href="#">Jira Tickets</a></p>

          <ul>
              <li>SlipStream: 3.77</li>
              <li>MonoWeb: 2.109</li>
          </ul>
      </div>
     </div>

    <div class="team">
        <h4>Expansion</h4>

        <h5>Web</h5>

        <ul>
            <li>Added</li>
            <ul>
              <li>None</li>
            </ul>
            <li>Fixed</li>
            <ul>
              <li>Content not displaying on tablet</li>
            </ul>
        </ul>

        <h5>Mobile</h5>

        <ul>
            <li>Added</li>
            <ul>
                <li>None</li>
            </ul>
            <li>Fixed</li>
            <ul>
                <li>None</li>
            </ul>
        </ul>
    </div>

    <div class="team">
        <h4>Explore and Evaluation</h4>

        <h5>Web</h5>

        <ul>
            <li>Added</li>
            <ul>
              <li>Quick add bundling section on PDP</li>
            </ul>
            <li>Fixed</li>
            <ul>
              <li>Country Param being added as a refinement</li>
              <li>Jump links are broken</li>
            </ul>
        </ul>

        <h5>Mobile</h5>

        <ul>
            <li>Added</li>
            <ul>
                <li>Quick Add bundling section on PDP</li>
            </ul>
            <li>Fixed</li>
            <ul>
                <li>FP Classes navigates user to ShopTab prior to showing content</li>
                <li>1 Android crasher resolved</li>
            </ul>
        </ul>
    </div>

</template>

<style>
.headers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 10px;
    margin-bottom: 20px;
}
.header-section {
    padding: 20px;
    border: 1px dashed #CCC;
}

.team {
    border-bottom: 1px solid #BBB;
    margin-bottom: 20px;
    padding-bottom: 20px;
}

h3 {
    background-color: #bada55;
    padding: 5px;
    margin-bottom: 10px;
}

h4 {
    font-size: 22px;
}

h5 {
    font-weight: bold;
}

</style>
