<template>
    <div id="login_page">
        <b-container fluid class="bg-primary text-light">
            <b-row class="py-2">
                <b-col>
                    <h1>Content Editor</h1>
                </b-col>
            </b-row>
        </b-container>
        <b-container fluid class="bg-white text-dark">
            <b-row class="py-5">
                <b-col cols="4" offset="4">
                    <b-card>
                        <h2 slot="header" class="text-center">Login</h2>
                        <b-input id="login-email"
                                 v-model="email"
                                 name="username"
                                 type="email"
                                 class="mt-3"
                                 placeholder="E-mail address"
                                 required
                                 autocomplete="username"
                        />
                        <b-input id="login-password"
                                 v-model="password"
                                 :type="showPassword ? 'text' : 'password'"
                                 name="password"
                                 class="mt-3"
                                 placeholder="Password"
                                 required
                                 autocomplete="current-password"
                                 @keyup.native.enter="doTheLogin"
                        />
                        <b-checkbox id="login-reveal-password"
                                    v-model="showPassword"
                                    class="mt-4"
                        >Show password</b-checkbox>
                        <b-button id="login-button"
                                  class="float-right mt-3"
                                  variant="primary"
                                  @click="doTheLogin"
                        >Login</b-button>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            password: '',
            showPassword: false
        }
    },
    methods: {
        doTheLogin() {
            this.$axios.post(
                '/login',
                { email: this.email, password: this.password }
            ).then(response => {
                if (response.data.token) {
                    localStorage.setItem('unijobs_magic_token', response.data.token);
                    this.$router.push({ path: this.$route.query.redirect || '/' })
                } else {
                    // TODO Show error maybe?
                }
            }).catch(error => {
                console.debug(error);
            })
        }
    }
}
</script>
