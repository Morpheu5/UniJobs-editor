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
                        <h2 slot="header" class="text-center">{{ $t('login') }}</h2>
                        <b-input-group>
                            <b-input id="login-email"
                                     v-model="email"
                                     :placeholder="$t('login_page.email_address')"
                                     name="username"
                                     type="email"
                                     class="my-3"
                                     required
                                     autocomplete="username"
                            />
                        </b-input-group>
                        <b-input-group>
                            <b-input id="login-password"
                                     v-model="password"
                                     :type="showPassword ? 'text' : 'password'"
                                     :placeholder="$t('login_page.password')"
                                     name="password"
                                     class=""
                                     required
                                     autocomplete="current-password"
                                     @keyup.native.enter="doTheLogin"
                            />
                            <b-input-group-append>
                                <b-button variant="outline-secondary" @click="showPassword = !showPassword"><fa :icon="['far', showPassword ? 'eye-slash' : 'eye']" /></b-button>
                            </b-input-group-append>
                        </b-input-group>
                        <b-button id="login-button"
                                  class="float-right mt-3"
                                  variant="primary"
                                  @click="doTheLogin"
                        >{{ $t('login') }}</b-button>
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
        };
    },
    methods: {
        doTheLogin() {
            this.$axios.post(
                '/api/login',
                { email: this.email, password: this.password }
            ).then(response => {
                if (response.data.token) {
                    localStorage.setItem('unijobs_magic_token', response.data.token);
                    this.$router.push({ path: this.$route.query.redirect || '/' });
                } else {
                    // TODO Show error maybe?
                }
            }).catch(error => {
                console.debug(error);
            });
        }
    }
};
</script>
