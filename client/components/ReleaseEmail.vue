<script>
export default {
  props: {
    release: {
      type: String,
      required: true,
      validator: function (value) {
        return value.trim().length > 0;
      }
    }
  }
}
</script>

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
            </ul> <!-- Corrected: Added missing closing tag -->
            <li>Fixed</li>
            <ul>
                <li>Content not displaying on tablet</li>
            </ul> <!-- Corrected: Added missing closing tag -->
        </ul>

        <h5>Mobile</h5>

        <ul>
            <li>Added</li>
            <ul>
                <li>None</li>
            </ul> <!-- Corrected: Added missing closing tag -->
            <li>Fixed</li>
            <ul>
                <li>None</li>
            </ul> <!-- Corrected: Added missing closing tag -->
        </ul>
    </div>

    <div class="team">
        <h4>Explore and Evaluation</h4>

        <h5>Web</h5>

        <ul>
            <li>Added</li>
            <ul>
                <li>Quick add bundling section on PDP</li>
            </ul> <!-- Corrected: Added missing closing tag -->
            <li>Fixed</li>
            <ul>
                <li>Country Param being added as a refinement</li>
                <li>Jump links are broken</li>
            </ul> <!-- Corrected: Added missing closing tag -->
        </ul>

        <h5>Mobile</h5>

        <ul>
            <li>Added</li>
            <ul>
                <li>Quick Add bundling section on PDP</li>
            </ul> <!-- Corrected: Added missing closing tag -->
            <li>Fixed</li>
            <ul>
                <li>FP Classes navigates user to ShopTab prior to showing content</li>
                <li>1 Android crasher resolved</li>
            </ul> <!-- Corrected: Added missing closing tag -->
        </ul>
    </div>
</template>
