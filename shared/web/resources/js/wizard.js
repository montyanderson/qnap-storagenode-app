function resizeInterface() {
	const scale = Math.min(window.innerWidth / 1400, window.innerHeight / 900);
	document.querySelector("#app").style.transform = `scale(${scale})`;
}

resizeInterface();

let debug = false;

const getFolders = debug
	? async path => {
		if(path === '/') {
			return [
				'test/',
				'a/',
				'b/',
				'c/'
			]
		}

		if(path === '/a/') {
			return [
				'photos/',
				'documents/'
			]
		}

		if(path === '/a/photos/') {
			return [
				'holiday/',
				'mountains/'
			]
		}

		return new Promise(resolve => {});
	}
	: async path => {
		const {data} = await axios.get('api.php', {
			params: {
				action: 'folders',
				path
			}
		});

		return data;
	};

Vue.component(`file-browser`, {
	template: `<div class='file-browser'>
		<div class='file-browser-container'>
			<h2 class='file-browser-path'>{{path}}</h2>

			<ul class='file-browser-list'>
				<li class="file-browser-file" v-on:dblclick="path = path.slice(0, -1).split('/').slice(0, -1).join('/') + '/'">../</li>

				<li
					v-for="file in files" v-on:dblclick="path += file"
					v-on:click="selectFile(file)"
					v-bind:class="{
						'file-browser-file': true,
						'file-browser-selected': selectedPath === path + file
					}"
				>{{file}}</li>
			</ul>

			<button class='file-browser-done' v-on:click="done">Done</button>
		</div>
	</div>`,
	data: () => ({
		path: '/',
		files: [],
		selectedPath: '',
		loading: false
	}),
	methods: {
		async loadFiles() {
			this.loading = true;
			this.files = (await getFolders(this.path)).filter(file => file !== '../');
			this.loading = false;
		},

		selectFile(file) {
			if(this.loading === false) {
				this.selectedPath = this.path + file;
			}
		},

		done() {
			this.$emit('selected', this.selectedPath);
		}
	},
	watch: {
		path() {
			this.loadFiles();
		}
	},
	async created() {
		this.loadFiles();
	}
});

const app = new Vue({
	el: "#app",
	data: {
		step: 5,
		identityStep: 1,
		identityLogs: '',

		email: '',
		address: '',
		storage: 10000,
		directory: '',
		directoryBrowse: false,
		host: '',
		identity: '',
		authkey: '',
		message: '',
		processrun: false
	},

	created () {
        this.email = document.querySelector(".email").value
        this.address = document.querySelector(".address").value
        this.storage = document.querySelector(".storage").value
        this.directory = document.querySelector(".directory").value
        this.host = document.querySelector(".host").value
        this.identity = document.querySelector(".identity").value

        this.authkey = document.querySelector("#authkey").value
    },

	computed: {

		stepClass() {
			const obj = {};

			obj['step'] = true;
			obj[`step-${this.step}`] = true;

			return obj;
		},

		emailValid() {
			return this.email.match(
				/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			);
		},

		addressValid() {
			return this.address.match(/^0x[a-fA-F0-9]{40}$/g);
		},

		storageValid() {
			return this.storage > 0;
		},

		directoryValid() {
			return this.directory.length > 1;
		},

		hostValid() {
			const [host, port] = this.host.split(':');

			if(typeof port !== 'string' || port.length === 0) {
				return false;
			}

			if(isNaN(Number(port)) === true) {
				return false;
			}

			return true;
		},

		identityValid() {
			return this.identity.length > 1;
		},

		authkeyValid() {
			if(this.processrun ==false){
				return this.authkey.length > 1;
			}
		},

		identityGenerationFinished() {
			return this.message.toLowerCase().includes('found');
		}
	},
	methods: {
		async generateIdentity() {
			 this.identityStep++;
			 this.createidentifyToken();
			 setInterval(() => this.updateLog(), 60000);
		},

		setDirectory(selected) {
			this.directory = selected;
			this.directoryBrowse = false;
		},

		async finish() {
			const data = {
				email: this.email,
				address: this.address,
				host: this.host,
				storage: this.storage,
				directory: this.directory,
				identity: this.identity
			};

			await axios.post('config.php', data);

			location.href = 'config.php';
		},

			async createidentifyToken() {

				const {data} = await axios.post('identity.php', {
					authkey: this.authkey,
					identity: this.identity,
				});

				this.message = data;

				if(data !== "Identity Key File and others already available"){
					this.message = "<p>"+data+"</p>";
				}

        	},

        	async updateLog() {
				const {data} = await axios.post('identity.php', {
					status: true
				});

				this.message = data;
			},

			async processCheck() {
				this.identityStep++;
				const {data} = await axios.post('identity.php', {
					identityCreationProcessCheck: true
				});

				this.processrun = data;
			},

	}
});
